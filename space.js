/* Decorative WebGL scene and progressive motion. No network or dependencies. */
(() => {
  'use strict';

  const canvas = document.querySelector('#space-canvas');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const root = document.documentElement;
  let observer;
  let activeTilt = null;
  let pointerX = 0;
  let pointerY = 0;
  let smoothX = 0;
  let smoothY = 0;
  let frameId = 0;
  let previousFrame = 0;
  let needsResize = true;
  let renderer = null;

  const revealSelectors = '.section-heading,.project-card,.explorer,.about-card,.about-copy,.skills-grid>div,.next-project,.contact-heading';

  function revealElements() {
    document.querySelectorAll(revealSelectors).forEach(element => element.classList.add('reveal'));
    const elements = document.querySelectorAll('.reveal:not([data-reveal-bound])');
    elements.forEach((element, index) => {
      element.dataset.revealBound = 'true';
      element.style.setProperty('--reveal-delay', `${Math.min(index % 3, 2) * 65}ms`);
      if (reducedMotion.matches || !observer) element.classList.add('is-visible');
      else observer.observe(element);
    });
  }

  function setupReveals() {
    if ('IntersectionObserver' in window && !reducedMotion.matches) {
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.06, rootMargin: '0px 0px 35px 0px' });
      root.classList.add('motion-ready');
    }
    revealElements();
  }

  function clearTilt() {
    if (!activeTilt) return;
    activeTilt.style.setProperty('--tilt-x', '0deg');
    activeTilt.style.setProperty('--tilt-y', '0deg');
    if (activeTilt.classList.contains('portrait')) {
      activeTilt.style.setProperty('--portrait-x', '0px');
      activeTilt.style.setProperty('--portrait-y', '0px');
    }
    activeTilt = null;
  }

  document.addEventListener('pointermove', event => {
    if (reducedMotion.matches || !finePointer.matches) return;
    pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
    pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
    const target = event.target instanceof Element ? event.target.closest('.hero-visual,.project-visual,.portrait') : null;
    if (target !== activeTilt) clearTilt();
    if (!target) return;
    activeTilt = target;
    const rect = target.getBoundingClientRect();
    const x = Math.max(-0.5, Math.min(0.5, (event.clientX - rect.left) / rect.width - 0.5));
    const y = Math.max(-0.5, Math.min(0.5, (event.clientY - rect.top) / rect.height - 0.5));
    const portrait = target.classList.contains('portrait');
    const range = target.classList.contains('hero-visual') || portrait ? 7 : 4;
    target.style.setProperty('--tilt-x', `${(-y * range).toFixed(2)}deg`);
    target.style.setProperty('--tilt-y', `${(x * range).toFixed(2)}deg`);
    if (portrait) {
      target.style.setProperty('--portrait-x', `${(x * 10).toFixed(2)}px`);
      target.style.setProperty('--portrait-y', `${(y * 10).toFixed(2)}px`);
    }
  }, { passive: true });
  document.addEventListener('pointerleave', clearTilt, { passive: true });
  window.addEventListener('blur', () => { pointerX = 0; pointerY = 0; clearTilt(); });
  document.addEventListener('portfolio:rendered', revealElements);
  setupReveals();
  if (!canvas) return;

  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.pointerEvents = 'none';

  const vertexSource = `
    attribute vec2 aPosition;
    void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
  `;

  const fragmentSource = `
    precision highp float;
    uniform vec2 uResolution;
    uniform vec2 uPointer;
    uniform float uTime;
    uniform float uScroll;
    uniform float uReduced;
    #define PI 3.14159265359

    float hash21(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }
    float noise(vec3 p) {
      vec3 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      vec2 z = vec2(37.0, 91.0);
      vec2 q = i.xy + z * i.z;
      float a = mix(hash21(q), hash21(q + vec2(1.0,0.0)), f.x);
      float b = mix(hash21(q + vec2(0.0,1.0)), hash21(q + vec2(1.0,1.0)), f.x);
      float c = mix(hash21(q + z), hash21(q + z + vec2(1.0,0.0)), f.x);
      float d = mix(hash21(q + z + vec2(0.0,1.0)), hash21(q + z + vec2(1.0,1.0)), f.x);
      return mix(mix(a,b,f.y), mix(c,d,f.y), f.z);
    }
    float fbm(vec3 p) {
      float value = 0.0, amplitude = 0.55;
      for (int i = 0; i < 4; i++) {
        value += noise(p) * amplitude;
        p = p * 2.03 + vec3(2.7,1.3,0.8);
        amplitude *= 0.48;
      }
      return value;
    }
    mat2 rotation(float angle) {
      return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    }
    float stars(vec2 pixel, float cellSize, float layer) {
      vec2 cell = floor(pixel / cellSize);
      vec2 local = fract(pixel / cellSize);
      float seed = hash21(cell + layer * 71.0);
      vec2 position = vec2(hash21(cell + 12.3 + layer), hash21(cell + 31.7 + layer));
      float distance = length((local - position) * cellSize);
      float radius = mix(0.35,1.0,seed);
      float star = exp(-distance * distance / (radius * radius));
      float twinkle = mix(0.55,1.0,0.5 + 0.5*sin(uTime * 0.65 + seed * 18.0));
      return star * step(0.81,seed) * mix(twinkle,0.8,uReduced);
    }
    vec3 background(vec2 uv) {
      vec3 color = vec3(0.010,0.018,0.042);
      vec2 p = uv - vec2(0.78,0.61);
      color += vec3(0.025,0.018,0.085) * exp(-dot(p * vec2(1.0,1.7), p * vec2(1.0,1.7)) * 4.0);
      p = uv - vec2(0.2,0.15);
      color += vec3(0.005,0.025,0.042) * exp(-dot(p,p)*6.0);
      vec2 starPixels = gl_FragCoord.xy + uPointer * vec2(5.0,3.0);
      float field = stars(starPixels,47.0,1.0) + stars(starPixels + vec2(uTime*0.2,0.0),83.0,2.0)*0.8;
      color += vec3(0.51,0.68,0.91) * field;
      return color;
    }
    void main() {
      vec2 uv = gl_FragCoord.xy / uResolution;
      float aspect = uResolution.x / uResolution.y;
      vec3 color = background(uv);
      bool mobile = aspect < 0.85;
      float radius = mobile ? 0.30 : 0.42;
      vec2 center = mobile ? vec2(0.82,0.53) : vec2(0.77,0.65);
      center += uPointer * vec2(0.010,-0.009);
      center.y += uScroll * 0.00015;
      vec2 p = (uv-center)*vec2(aspect*2.0,2.0);
      p *= rotation(-0.21);
      vec3 rayOrigin = vec3(p,4.0);
      vec3 rayDirection = vec3(0.0,0.0,-1.0);
      float planetFade = 1.0-smoothstep(150.0,900.0,uScroll);
      float distanceToCenter = length(p);
      float halo = exp(-max(0.0,distanceToCenter-radius)*13.0) * smoothstep(radius*0.72,radius*1.15,distanceToCenter);
      color += vec3(0.045,0.26,0.48)*halo*0.30*planetFade;
      color += vec3(0.16,0.055,0.34)*exp(-distanceToCenter*2.2)*0.21*planetFade;

      float discriminant = radius*radius-dot(p,p);
      float sphereT = 10000.0;
      if (discriminant > 0.0) {
        sphereT = 4.0-sqrt(discriminant);
        vec3 hit = rayOrigin+rayDirection*sphereT;
        vec3 normal = normalize(hit);
        vec3 textureNormal=normal;
        textureNormal.xz = rotation(uTime*0.045) * textureNormal.xz;
        textureNormal.xy = rotation(-0.35) * textureNormal.xy;
        float turbulence = fbm(textureNormal*5.0+vec3(0.0,uTime*0.008,0.0));
        float bands = sin(textureNormal.y*24.0+turbulence*7.0)*0.5+0.5;
        float fineBands = sin(textureNormal.y*67.0+turbulence*5.0)*0.5+0.5;
        float clouds = smoothstep(0.15,0.92,bands);
        vec3 surface = mix(vec3(0.08,0.14,0.29),vec3(0.38,0.60,0.77),clouds);
        surface = mix(surface,vec3(0.40,0.25,0.54),smoothstep(0.40,0.72,turbulence)*0.63);
        surface += vec3(0.055,0.11,0.15)*fineBands*0.32;
        vec3 light = normalize(vec3(-0.72,0.78,1.38));
        float diffuse = max(0.0,dot(normal,light));
        float rim = pow(1.0-max(0.0,normal.z),2.5);
        float highlight = pow(max(dot(reflect(-light,normal),vec3(0.0,0.0,1.0)),0.0),18.0);
        vec3 planet = surface*(0.18+diffuse*0.99);
        planet += vec3(0.32,0.72,1.0)*rim*(0.27+diffuse*0.80);
        planet += vec3(0.20,0.28,0.40)*highlight*0.12;
        color=mix(color,planet,planetFade);
      }

      vec3 ringNormal = normalize(vec3(0.18,0.84,0.51));
      float ringT=dot(-rayOrigin,ringNormal)/dot(rayDirection,ringNormal);
      vec3 ringHit=rayOrigin+rayDirection*ringT;
      float ringDistance=length(ringHit);
      float inner=radius*1.18, outer=radius*2.04;
      if(ringT>0.0 && ringT<sphereT && ringDistance>inner && ringDistance<outer){
        float band=smoothstep(inner,inner+radius*0.09,ringDistance)*(1.0-smoothstep(outer-radius*0.09,outer,ringDistance));
        float striations=0.68+0.32*sin(ringDistance*260.0);
        float wide=0.77+0.23*sin(ringDistance*105.0);
        float gap=1.0-0.88*exp(-pow((ringDistance-radius*1.62)/(radius*0.04),2.0));
        float lighting=0.40+0.60*max(0.0,dot(normalize(ringHit),normalize(vec3(-1.0,1.0,0.7))));
        float alpha=band*striations*wide*gap*0.76*planetFade;
        vec3 ringColor=mix(vec3(0.44,0.30,0.63),vec3(0.47,0.81,0.97),lighting);
        color=mix(color,ringColor,alpha);
      }
      gl_FragColor=vec4(color,1.0);
    }
  `;

  function makeWebGLRenderer() {
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
    if (!gl) return null;
    function compile(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); return null; }
      return shader;
    }
    const vertex = compile(gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertex || !fragment) return null;
    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { gl.deleteProgram(program);return null; }
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    gl.useProgram(program);
    const position = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const uniforms = Object.fromEntries(['uResolution','uPointer','uTime','uScroll','uReduced'].map(name => [name, gl.getUniformLocation(program,name)]));
    root.dataset.spaceRenderer = 'webgl';
    return {
      resize(width,height) { gl.viewport(0,0,width,height); },
      draw(time) {
        gl.useProgram(program);
        gl.uniform2f(uniforms.uResolution,canvas.width,canvas.height);
        gl.uniform2f(uniforms.uPointer,smoothX,smoothY);
        gl.uniform1f(uniforms.uTime,reducedMotion.matches ? 0 : time);
        gl.uniform1f(uniforms.uScroll,window.scrollY);
        gl.uniform1f(uniforms.uReduced,reducedMotion.matches ? 1 : 0);
        gl.drawArrays(gl.TRIANGLES,0,6);
      }
    };
  }

  function makeFallbackRenderer() {
    root.dataset.spaceRenderer = 'fallback';
    const context = canvas.getContext('2d');
    if (!context) { canvas.style.opacity='0';return null; }
    return {
      resize() {},
      draw() {
        const width=canvas.width,height=canvas.height;
        context.clearRect(0,0,width,height);
        context.fillStyle='#050a18';context.fillRect(0,0,width,height);
        for(let i=0;i<110;i++) {
          const x=(Math.sin(i*127.1+12)*43758.5453)%1,y=(Math.sin(i*311.7+9)*19267.193)%1;
          context.globalAlpha=0.25+(i%4)*0.12;context.fillStyle='#a3c9ed';
          context.fillRect(Math.abs(x)*width,Math.abs(y)*height,i%5===0?1.5:1,i%5===0?1.5:1);
        }
        context.globalAlpha=1;
        const mobile = width / height < .85;
        const fade = Math.max(0, 1 - window.scrollY / 900);
        const x = width * (mobile ? .82 : .77);
        const y = height * (mobile ? .47 : .35);
        const r = height * (mobile ? .15 : .21);
        context.save();
        context.globalAlpha = fade;
        const glow=context.createRadialGradient(x-r*.4,y-r*.4,0,x,y,r*1.5);
        glow.addColorStop(0,'#244c69');glow.addColorStop(.55,'#111d3a');glow.addColorStop(1,'#050a18');
        context.fillStyle=glow;context.beginPath();context.arc(x,y,r*1.5,0,Math.PI*2);context.fill();
        context.save();context.translate(x,y);context.rotate(-.38);context.strokeStyle='#879dd8';context.globalAlpha=fade*.6;context.lineWidth=3;
        context.beginPath();context.ellipse(0,0,r*1.8,r*.5,0,0,Math.PI*2);context.stroke();context.restore();
        const sphere = context.createRadialGradient(x-r*.35,y-r*.4,r*.04,x,y,r);
        sphere.addColorStop(0,'#8bd5ed');sphere.addColorStop(.56,'#526ca9');sphere.addColorStop(1,'#263350');
        context.fillStyle=sphere;context.beginPath();context.arc(x,y,r,0,Math.PI*2);context.fill();
        context.translate(x,y);context.rotate(-.38);context.strokeStyle='#a7c4f4';context.globalAlpha=fade*.68;context.lineWidth=3;
        context.beginPath();context.ellipse(0,0,r*1.8,r*.5,0,0,Math.PI);context.stroke();
        context.restore();
      }
    };
  }

  function resize() {
    const mobile=window.innerWidth<700;
    const dpr=Math.min(window.devicePixelRatio||1,mobile?1:1.25);
    const scale=Math.min(1,1600/(window.innerWidth*dpr));
    canvas.width=Math.max(1,Math.round(window.innerWidth*dpr*scale));
    canvas.height=Math.max(1,Math.round(window.innerHeight*dpr*scale));
    renderer?.resize(canvas.width,canvas.height);
    needsResize=false;
  }

  function frame(now) {
    frameId=0;
    if(document.hidden||!renderer)return;
    const frameDelay=window.innerWidth<700||navigator.connection?.saveData?42:32;
    if(needsResize||now-previousFrame>=frameDelay){
      previousFrame=now;
      if(needsResize)resize();
      smoothX+=(pointerX-smoothX)*0.045;smoothY+=(pointerY-smoothY)*0.045;
      renderer.draw(now/1000);
    }
    if(!reducedMotion.matches)frameId=requestAnimationFrame(frame);
  }
  function requestFrame() {
    if(!frameId&&!document.hidden)frameId=requestAnimationFrame(frame);
  }
  function preferenceChanged() {
    pointerX=pointerY=smoothX=smoothY=0;clearTilt();
    if(reducedMotion.matches){
      root.classList.remove('motion-ready');
      document.querySelectorAll('.reveal').forEach(element=>element.classList.add('is-visible'));
    } else if(observer) root.classList.add('motion-ready');
    else setupReveals();
    requestFrame();
  }

  try { renderer=makeWebGLRenderer()||makeFallbackRenderer(); } catch { canvas.style.opacity='0';root.dataset.spaceRenderer='css'; }
  window.addEventListener('resize',()=>{needsResize=true;requestFrame();},{passive:true});
  window.addEventListener('scroll',()=>{if(reducedMotion.matches)requestFrame();},{passive:true});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){cancelAnimationFrame(frameId);frameId=0;}else requestFrame();
  });
  if(reducedMotion.addEventListener)reducedMotion.addEventListener('change',preferenceChanged);
  else reducedMotion.addListener(preferenceChanged);
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();cancelAnimationFrame(frameId);frameId=0;renderer=null;root.dataset.spaceRenderer='css';canvas.style.opacity='0';});
  canvas.addEventListener('webglcontextrestored',()=>{canvas.style.opacity='';renderer=makeWebGLRenderer();needsResize=true;requestFrame();});
  requestFrame();
})();
