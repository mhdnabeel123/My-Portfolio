'use client';
import { useEffect, useRef } from 'react';

function SplashCursor({
  SIM_RESOLUTION = 64,
  DYE_RESOLUTION = 512,
  CAPTURE_RESOLUTION = 256,
  DENSITY_DISSIPATION = 3.5,
  VELOCITY_DISSIPATION = 2,
  PRESSURE = 0.1,
  PRESSURE_ITERATIONS = 20,
  CURL = 3,
  SPLAT_RADIUS = 0.2,
  SPLAT_FORCE = 6000,
  SHADING = true,
  COLOR_UPDATE_SPEED = 10,
  BACK_COLOR = { r: 0, g: 0, b: 0 },
  TRANSPARENT = true,
  RAINBOW_MODE = true,
  COLOR = { r: 0.4, g: 0.4, b: 0.9 }
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function pointerPrototype() {
      this.id = -1;
      this.texcoordX = 0;
      this.texcoordY = 0;
      this.prevTexcoordX = 0;
      this.prevTexcoordY = 0;
      this.deltaX = 0;
      this.deltaY = 0;
      this.down = false;
      this.moved = false;
      this.color = [30, 0, 300];
    }

    let config = {
      SIM_RESOLUTION,
      DYE_RESOLUTION,
      CAPTURE_RESOLUTION,
      DENSITY_DISSIPATION,
      VELOCITY_DISSIPATION,
      PRESSURE,
      PRESSURE_ITERATIONS,
      CURL,
      SPLAT_RADIUS,
      SPLAT_FORCE,
      SHADING,
      COLOR_UPDATE_SPEED,
      PAUSED: false,
      BACK_COLOR,
      TRANSPARENT,
      RAINBOW_MODE,
      COLOR
    };

    let pointers = [new pointerPrototype()];

    let gl;
    let ext;
    let dye;
    let velocity;
    let divergence;
    let curl;
    let pressure;
    let copyProgram;
    let splatProgram;
    let curlProgram;
    let vorticityProgram;
    let divergenceProgram;
    let pressureProgram;
    let gradSubProgram;
    let advectionProgram;
    let displayMaterial;
    let animationId;
    let handleMouseDown;
    let handleMouseMove;
    let handleMouseUp;

    try {
      const context = getWebGLContext(canvas);
      gl = context.gl;
      ext = context.ext;

      if (!gl || !ext) return;

      if (!ext.supportLinearFiltering) {
        config.DYE_RESOLUTION = 256;
        config.SHADING = false;
      }

      function getWebGLContext(canvas) {
        const params = {
          alpha: true,
          depth: false,
          stencil: false,
          antialias: false,
          preserveDrawingBuffer: false
        };
        let gl = canvas.getContext('webgl2', params);
        const isWebGL2 = !!gl;
        if (!isWebGL2) gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);
        
        let halfFloat;
        let supportLinearFiltering;
        if (isWebGL2) {
          gl.getExtension('EXT_color_buffer_float');
          supportLinearFiltering = gl.getExtension('OES_texture_float_linear');
        } else {
          halfFloat = gl.getExtension('OES_texture_half_float');
          supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear');
        }
        
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        const halfFloatTexType = isWebGL2 ? gl.HALF_FLOAT : (halfFloat ? halfFloat.HALF_FLOAT_OES : gl.UNSIGNED_BYTE);
        
        let formatRGBA = getSupportedFormat(gl, isWebGL2 ? gl.RGBA16F : gl.RGBA, gl.RGBA, halfFloatTexType);
        let formatRG = getSupportedFormat(gl, isWebGL2 ? gl.RG16F : gl.RGBA, isWebGL2 ? gl.RG : gl.RGBA, halfFloatTexType);
        let formatR = getSupportedFormat(gl, isWebGL2 ? gl.R16F : gl.RGBA, isWebGL2 ? gl.RED : gl.RGBA, halfFloatTexType);

        return {
          gl,
          ext: {
            formatRGBA,
            formatRG,
            formatR,
            halfFloatTexType,
            supportLinearFiltering
          }
        };
      }

      function getSupportedFormat(gl, internalFormat, format, type) {
        if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
          switch (internalFormat) {
            case gl.R16F: return getSupportedFormat(gl, gl.RG16F, gl.RG, type);
            case gl.RG16F: return getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type);
            default: return null;
          }
        }
        return { internalFormat, format };
      }

      function supportRenderTextureFormat(gl, internalFormat, format, type) {
        let texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
        let fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        return status === gl.FRAMEBUFFER_COMPLETE;
      }

      function hashCode(s) {
        let hash = 0;
        if (s.length === 0) return hash;
        for (let i = 0; i < s.length; i++) {
          hash = (hash << 5) - hash + s.charCodeAt(i);
          hash |= 0;
        }
        return hash;
      }

      function addKeywords(source, keywords) {
        if (keywords == null) return source;
        let keywordsString = '';
        keywords.forEach((keyword) => {
          keywordsString += '#define ' + keyword + '\n';
        });
        return keywordsString + source;
      }

      function compileShader(type, source, keywords) {
        source = addKeywords(source, keywords);
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(shader);
        return shader;
      }

      function createProgram(vertexShader, fragmentShader) {
        let program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw gl.getProgramInfoLog(program);
        return program;
      }

      function getUniforms(program) {
        let uniforms = [];
        let uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < uniformCount; i++) {
          let uniformName = gl.getActiveUniform(program, i).name;
          uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
        }
        return uniforms;
      }

      function Material(vertexShader, fragmentShaderSource) {
        this.vertexShader = vertexShader;
        this.fragmentShaderSource = fragmentShaderSource;
        this.programs = [];
        this.keywords = [];
      }
      Material.prototype.setKeywords = function (keywords) {
        this.keywords = keywords;
        let hash = 0;
        for (let i = 0; i < keywords.length; i++) hash += hashCode(keywords[i]);
        let program = this.programs[hash];
        if (program == null) {
          let fragmentShader = compileShader(gl.FRAGMENT_SHADER, this.fragmentShaderSource, keywords);
          program = createProgram(this.vertexShader, fragmentShader);
          this.programs[hash] = program;
        }
        this.program = program;
        this.uniforms = getUniforms(this.program);
      };
      Material.prototype.bind = function () {
        gl.useProgram(this.program);
      };

      function Program(vertexShader, fragmentShader) {
        this.program = createProgram(vertexShader, fragmentShader);
        this.uniforms = getUniforms(this.program);
      }
      Program.prototype.bind = function () {
        gl.useProgram(this.program);
      };

      const baseVertexShader = compileShader(gl.VERTEX_SHADER, `
        precision highp float;
        attribute vec2 aPosition;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform vec2 texelSize;
        void main () {
            vUv = aPosition * 0.5 + 0.5;
            vL = vUv - vec2(texelSize.x, 0.0);
            vR = vUv + vec2(texelSize.x, 0.0);
            vT = vUv + vec2(0.0, texelSize.y);
            vB = vUv - vec2(0.0, texelSize.y);
            gl_Position = vec4(aPosition, 0.0, 1.0);
        }
      `);

      copyProgram = new Program(baseVertexShader, compileShader(gl.FRAGMENT_SHADER, `
        precision mediump float;
        precision mediump sampler2D;
        varying vec2 vUv;
        uniform sampler2D uTexture;
        void main () {
            gl_FragColor = texture2D(uTexture, vUv);
        }
      `));

      splatProgram = new Program(baseVertexShader, compileShader(gl.FRAGMENT_SHADER, `
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        uniform sampler2D uTarget;
        uniform float aspect;
        uniform vec3 color;
        uniform vec2 point;
        uniform float radius;
        void main () {
            vec2 p = vUv - point.xy;
            p.x *= aspect;
            vec3 splat = exp(-dot(p, p) / radius) * color;
            vec3 base = texture2D(uTarget, vUv).xyz;
            gl_FragColor = vec4(base + splat, 1.0);
        }
      `));

      curlProgram = new Program(baseVertexShader, compileShader(gl.FRAGMENT_SHADER, `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uVelocity;
        void main () {
            float L = texture2D(uVelocity, vL).y;
            float R = texture2D(uVelocity, vR).y;
            float T = texture2D(uVelocity, vT).x;
            float B = texture2D(uVelocity, vB).x;
            float vorticity = R - L - T + B;
            gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
        }
      `));

      vorticityProgram = new Program(baseVertexShader, compileShader(gl.FRAGMENT_SHADER, `
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform sampler2D uVelocity;
        uniform sampler2D uCurl;
        uniform float curl;
        uniform float dt;
        void main () {
            float L = texture2D(uCurl, vL).x;
            float R = texture2D(uCurl, vR).x;
            float T = texture2D(uCurl, vT).x;
            float B = texture2D(uCurl, vB).x;
            float C = texture2D(uCurl, vUv).x;
            vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
            force /= length(force) + 0.0001;
            force *= curl * C;
            vec2 vel = texture2D(uVelocity, vUv).xy;
            gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);
        }
      `));

      divergenceProgram = new Program(baseVertexShader, compileShader(gl.FRAGMENT_SHADER, `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uVelocity;
        void main () {
            float L = texture2D(uVelocity, vL).x;
            float R = texture2D(uVelocity, vR).x;
            float T = texture2D(uVelocity, vT).y;
            float B = texture2D(uVelocity, vB).y;
            vec2 C = texture2D(uVelocity, vUv).xy;
            if (vL.x < 0.0) { L = -C.x; }
            if (vR.x > 1.0) { R = -C.x; }
            if (vT.y > 1.0) { T = -C.y; }
            if (vB.y < 0.0) { B = -C.y; }
            float div = 0.5 * (R - L + T - B);
            gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
        }
      `));

      pressureProgram = new Program(baseVertexShader, compileShader(gl.FRAGMENT_SHADER, `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uPressure;
        uniform sampler2D uDivergence;
        void main () {
            float L = texture2D(uPressure, vL).x;
            float R = texture2D(uPressure, vR).x;
            float T = texture2D(uPressure, vT).x;
            float B = texture2D(uPressure, vB).x;
            float C = texture2D(uPressure, vUv).x;
            float divergence = texture2D(uDivergence, vUv).x;
            gl_FragColor = vec4(0.25 * (L + R + T + B - divergence), 0.0, 0.0, 1.0);
        }
      `));

      gradSubProgram = new Program(baseVertexShader, compileShader(gl.FRAGMENT_SHADER, `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uPressure;
        uniform sampler2D uVelocity;
        void main () {
            float L = texture2D(uPressure, vL).x;
            float R = texture2D(uPressure, vR).x;
            float T = texture2D(uPressure, vT).x;
            float B = texture2D(uPressure, vB).x;
            vec2 vel = texture2D(uVelocity, vUv).xy;
            vel.x -= 0.5 * (R - L);
            vel.y -= 0.5 * (T - B);
            gl_FragColor = vec4(vel, 0.0, 1.0);
        }
      `));

      advectionProgram = new Program(baseVertexShader, compileShader(gl.FRAGMENT_SHADER, `
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        uniform sampler2D uVelocity;
        uniform sampler2D uSource;
        uniform vec2 texelSize;
        uniform vec2 dyeTexelSize;
        uniform float dt;
        uniform float dissipation;
        void main () {
            vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
            vec4 result = texture2D(uSource, coord);
            float decay = 1.0 + dissipation * dt;
            gl_FragColor = result / decay;
        }
      `));

      displayMaterial = new Material(baseVertexShader, `
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform sampler2D uTexture;
        
        void main () {
            vec3 c = texture2D(uTexture, vUv).rgb;
            #ifdef SHADING
                vec3 L = texture2D(uTexture, vL).rgb;
                vec3 R = texture2D(uTexture, vR).rgb;
                vec3 T = texture2D(uTexture, vT).rgb;
                vec3 B = texture2D(uTexture, vB).rgb;
                float diff = dot(c, vec3(0.299, 0.587, 0.114)) * 2.0 - 
                             dot(L, vec3(0.299, 0.587, 0.114)) - 
                             dot(R, vec3(0.299, 0.587, 0.114)) - 
                             dot(T, vec3(0.299, 0.587, 0.114)) - 
                             dot(B, vec3(0.299, 0.587, 0.114));
                c += diff * 0.5;
            #endif
            gl_FragColor = vec4(c, 1.0);
            #ifdef TRANSPARENT
                gl_FragColor.a = max(max(c.r, c.g), c.b);
            #endif
        }
      `);

      function createFBO(w, h, internalFormat, format, type, param) {
        gl.activeTexture(gl.TEXTURE0);
        let texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

        let fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

        return {
          texture,
          fbo,
          width: w,
          height: h,
          texelSizeX: 1.0 / w,
          texelSizeY: 1.0 / h,
          attach(id) {
            gl.activeTexture(gl.TEXTURE0 + id);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            return id;
          }
        };
      }

      function createDoubleFBO(w, h, internalFormat, format, type, param) {
        let fbo1 = createFBO(w, h, internalFormat, format, type, param);
        let fbo2 = createFBO(w, h, internalFormat, format, type, param);
        return {
          width: w,
          height: h,
          texelSizeX: fbo1.texelSizeX,
          texelSizeY: fbo1.texelSizeY,
          get read() { return fbo1; },
          get write() { return fbo2; },
          swap() { let temp = fbo1; fbo1 = fbo2; fbo2 = temp; }
        };
      }

      function getResolution(resolution) {
        let aspectRatio = gl.canvas.width / gl.canvas.height;
        if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;
        let min = resolution;
        let max = Math.round(resolution * aspectRatio);
        if (gl.canvas.width > gl.canvas.height) return { width: max, height: min };
        else return { width: min, height: max };
      }

      function initFramebuffers() {
        let simRes = getResolution(config.SIM_RESOLUTION);
        let dyeRes = getResolution(config.DYE_RESOLUTION);
        dye = createDoubleFBO(dyeRes.width, dyeRes.height, ext.formatRGBA.internalFormat, ext.formatRGBA.format, ext.halfFloatTexType, ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST);
        velocity = createDoubleFBO(simRes.width, simRes.height, ext.formatRG.internalFormat, ext.formatRG.format, ext.halfFloatTexType, ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST);
        divergence = createFBO(simRes.width, simRes.height, ext.formatR.internalFormat, ext.formatR.format, ext.halfFloatTexType, gl.NEAREST);
        curl = createFBO(simRes.width, simRes.height, ext.formatR.internalFormat, ext.formatR.format, ext.halfFloatTexType, gl.NEAREST);
        pressure = createDoubleFBO(simRes.width, simRes.height, ext.formatR.internalFormat, ext.formatR.format, ext.halfFloatTexType, gl.NEAREST);
      }

      const quadBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

      function blit(target) {
        if (target == null) {
          gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        } else {
          gl.viewport(0, 0, target.width, target.height);
          gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
        }
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }

      function render(target) {
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
        displayMaterial.setKeywords(config.SHADING ? ['SHADING'] : []);
        if (config.TRANSPARENT) displayMaterial.keywords.push('TRANSPARENT');
        displayMaterial.bind();
        gl.uniform2f(displayMaterial.uniforms.texelSize, 1.0 / canvas.width, 1.0 / canvas.height);
        gl.uniform1i(displayMaterial.uniforms.uTexture, dye.read.attach(0));
        blit(target);
      }

      function splat(x, y, dx, dy, color) {
        gl.viewport(0, 0, velocity.width, velocity.height);
        splatProgram.bind();
        gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
        gl.uniform1f(splatProgram.uniforms.aspect, canvas.width / canvas.height);
        gl.uniform2f(splatProgram.uniforms.point, x, y);
        gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0.0);
        gl.uniform1f(splatProgram.uniforms.radius, config.SPLAT_RADIUS / 100.0);
        blit(velocity.write);
        velocity.swap();

        gl.viewport(0, 0, dye.width, dye.height);
        gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
        gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b);
        blit(dye.write);
        dye.swap();
      }

      function step(dt) {
        gl.disable(gl.BLEND);
        gl.viewport(0, 0, velocity.width, velocity.height);

        curlProgram.bind();
        gl.uniform2f(curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
        blit(curl);

        vorticityProgram.bind();
        gl.uniform2f(vorticityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
        gl.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
        gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
        gl.uniform1f(vorticityProgram.uniforms.dt, dt);
        blit(velocity.write);
        velocity.swap();

        divergenceProgram.bind();
        gl.uniform2f(divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
        blit(divergence);

        copyProgram.bind();
        gl.uniform1i(copyProgram.uniforms.uTexture, pressure.read.attach(0));
        blit(pressure.write);
        pressure.swap();

        pressureProgram.bind();
        gl.uniform2f(pressureProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
        for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
          gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
          blit(pressure.write);
          pressure.swap();
        }

        gradSubProgram.bind();
        gl.uniform2f(gradSubProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(gradSubProgram.uniforms.uPressure, pressure.read.attach(0));
        gl.uniform1i(gradSubProgram.uniforms.uVelocity, velocity.read.attach(1));
        blit(velocity.write);
        velocity.swap();

        advectionProgram.bind();
        gl.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
        gl.uniform1i(advectionProgram.uniforms.uSource, velocity.read.attach(0));
        gl.uniform1f(advectionProgram.uniforms.dt, dt);
        gl.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION);
        blit(velocity.write);
        velocity.swap();

        gl.viewport(0, 0, dye.width, dye.height);
        gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
        gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
        gl.uniform1f(advectionProgram.uniforms.dissipation, config.DENSITY_DISSIPATION);
        blit(dye.write);
        dye.swap();
      }

      function update(dt) {
        let width = Math.floor(canvas.clientWidth * window.devicePixelRatio);
        let height = Math.floor(canvas.clientHeight * window.devicePixelRatio);
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
          initFramebuffers();
        }

        pointers.forEach((p) => {
          if (p.moved) {
            p.moved = false;
            let dx = p.deltaX * config.SPLAT_FORCE;
            let dy = p.deltaY * config.SPLAT_FORCE;
            splat(p.texcoordX, p.texcoordY, dx, dy, p.color);
          }
        });

        step(dt);
        render(null);
      }

      function generateColor() {
        let c = HSVtoRGB(Math.random(), 1.0, 1.0);
        c.r *= 0.15; c.g *= 0.15; c.b *= 0.15;
        return c;
      }
      
      function HSVtoRGB(h, s, v) {
        let r, g, b, i, f, p, q, t;
        i = Math.floor(h * 6); f = h * 6 - i; p = v * (1 - s); q = v * (1 - f * s); t = v * (1 - (1 - f) * s);
        switch (i % 6) {
          case 0: r = v; g = t; b = p; break;
          case 1: r = q; g = v; b = p; break;
          case 2: r = p; g = v; b = t; break;
          case 3: r = p; g = q; b = v; break;
          case 4: r = t; g = p; b = v; break;
          case 5: r = v; g = p; b = q; break;
          default: break;
        }
        return { r, g, b };
      }

      handleMouseMove = (e) => {
        let pointer = pointers[0];
        pointer.moved = pointer.down;
        pointer.prevTexcoordX = pointer.texcoordX;
        pointer.prevTexcoordY = pointer.texcoordY;
        pointer.texcoordX = e.clientX / canvas.clientWidth;
        pointer.texcoordY = 1.0 - e.clientY / canvas.clientHeight;
        pointer.deltaX = (pointer.texcoordX - pointer.prevTexcoordX);
        pointer.deltaY = (pointer.texcoordY - pointer.prevTexcoordY);
      };

      handleMouseDown = () => {
        let pointer = pointers[0];
        pointer.down = true;
        pointer.color = generateColor();
      };

      handleMouseUp = () => {
        pointers[0].down = false;
      };

      window.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      initFramebuffers();
      
      let lastTime = performance.now();
      function loop() {
        let now = performance.now();
        let dt = Math.min((now - lastTime) / 1000, 0.016);
        lastTime = now;
        update(dt);
        animationId = requestAnimationFrame(loop);
      }
      loop();

    } catch (e) {
      console.error("SplashCursor initialization or loop failed", e);
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, zIndex: 11000, pointerEvents: 'none', width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} style={{ width: '100vw', height: '100vh', display: 'block' }} />
    </div>
  );
}

export default SplashCursor;
