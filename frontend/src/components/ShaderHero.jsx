import React, { useEffect, useRef } from 'react';

export default function ShaderHero() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationFrameId;

    function syncSize() {
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(syncSize)
      : null;

    if (resizeObserver) {
      resizeObserver.observe(canvas);
    }
    syncSize();

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

    const fs = `precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
varying vec2 v_texCoord;

float circle(vec2 uv, vec2 pos, float rad, float blur) {
    float d = length(uv - pos);
    return smoothstep(rad, rad - blur, d);
}

float briefcase(vec2 uv, vec2 pos, float size) {
    vec2 p = abs(uv - pos);
    float body = max(p.x - size * 0.8, p.y - size * 0.5);
    vec2 hp = abs(uv - (pos + vec2(0.0, size * 0.5)));
    float handle = max(hp.x - size * 0.35, hp.y - size * 0.25);
    float handleCut = max(hp.x - size * 0.22, hp.y - size * 0.15);
    float h = max(handle, -handleCut);
    return min(body, h);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    
    vec3 cBg = vec3(0.98, 0.97, 1.0);
    vec3 cPrimary = vec3(0.208, 0.145, 0.804);
    vec3 cSecondary = vec3(0.443, 0.165, 0.886);
    vec3 cTertiary = vec3(0.0, 0.325, 0.22);
    vec3 cAccent = vec3(0.31, 0.275, 0.898);

    vec3 col = cBg;
    
    vec2 gv = fract(p * 8.0) - 0.5;
    float dots = length(gv);
    float grid = smoothstep(0.06, 0.02, dots) * 0.12;
    col -= vec3(grid);

    float t = u_time * 0.4;
    for(float i = 0.0; i < 4.0; i++) {
        float angle = t + i * 1.57;
        float dist = 0.45 + sin(t * 1.5 + i) * 0.1;
        vec2 nodePos = vec2(cos(angle), sin(angle)) * dist;
        
        float pulse = sin(u_time * 3.0 + i) * 0.5 + 0.5;
        float ring = abs(length(p - nodePos) - (0.08 + pulse * 0.04));
        float ringMask = smoothstep(0.015, 0.0, ring);
        
        float core = circle(p, nodePos, 0.05, 0.01);
        
        vec3 nodeColor = (i == 0.0 || i == 2.0) ? cPrimary : cSecondary;
        if(i == 3.0) nodeColor = cTertiary;
        
        col = mix(col, nodeColor, core);
        col = mix(col, nodeColor * 1.2, ringMask * 0.6);
        
        vec2 prevPos = vec2(cos(angle - 1.57), sin(angle - 1.57)) * (0.45 + sin(t * 1.5 + i - 1.0) * 0.1);
        vec2 pa = p - nodePos;
        vec2 ba = prevPos - nodePos;
        float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
        float dLine = length(pa - ba * h);
        float lineMask = smoothstep(0.008, 0.002, dLine);
        col = mix(col, cAccent, lineMask * 0.35);
    }
    
    float centerDist = length(p);
    float hubGlow = smoothstep(0.35, 0.0, centerDist);
    col = mix(col, cPrimary, hubGlow * 0.15);
    
    float hub = circle(p, vec2(0.0), 0.14, 0.01);
    col = mix(col, vec3(1.0), hub);
    
    float hubRing = abs(length(p) - 0.14);
    float hubRingMask = smoothstep(0.01, 0.0, hubRing);
    col = mix(col, cPrimary, hubRingMask);

    float iconDist = briefcase(p, vec2(0.0, -0.01), 0.06);
    float iconMask = smoothstep(0.005, 0.0, iconDist);
    col = mix(col, cPrimary, iconMask);
    
    for(float j = 1.0; j <= 3.0; j++) {
        float rad = fract(t * 0.3 + j * 0.33) * 0.9;
        float wave = abs(length(p) - rad);
        float waveMask = smoothstep(0.015, 0.0, wave) * smoothstep(0.9, 0.1, rad);
        col = mix(col, cSecondary, waveMask * 0.3);
    }

    gl_FragColor = vec4(col, 1.0);
}`;

    function createShader(gl, type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertShader = createShader(gl, gl.VERTEX_SHADER, vs);
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, fs);
    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return;
    }

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(program, 'a_position');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uRes = gl.getUniformLocation(program, 'u_resolution');

    const startTime = performance.now();

    function render() {
      syncSize();
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.useProgram(program);

      gl.enableVertexAttribArray(aPos);
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      gl.uniform1f(uTime, (performance.now() - startTime) * 0.001);
      gl.uniform2f(uRes, gl.canvas.width, gl.canvas.height);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    }

    render();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="relative h-[400px] bg-surface rounded-xl shadow-lg border border-outline-variant overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 w-full h-full">
        <canvas
          ref={canvasRef}
          id="shader-canvas-ANIMATION_13"
          style={{ display: 'block', width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
}
