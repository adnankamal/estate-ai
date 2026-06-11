"use client";

import React, { useEffect, useRef } from "react";

interface WebGLCanvasProps {
  variance: number;
  yield: number;
  score: number;
  propertyType: string;
}

export default function WebGLCanvas({ variance, yield: yieldValue, score, propertyType }: WebGLCanvasProps) {
  const canvasRef = useRef<any>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.error("WEBGL_CORE_UNAVAILABLE");
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    if (!rect.width || !rect.height) return;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);

    const vNorm = Math.max(-100, Math.min(100, variance)) / 100;
    const r = vNorm > 0 ? vNorm * 0.9 : 0;
    const g = vNorm < 0 ? Math.abs(vNorm) * 0.8 : 0.1;
    const b = 0.05;

    gl.clearColor(0.04, 0.04, 0.04, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    const size = 0.3;
    const vertices = new Float32Array([
      -size, -size,  size,   size, -size,  size,   size,  size,  size,
      -size, -size,  size,   size,  size,  size,  -size,  size,  size,
      -size, -size, -size,  -size,  size, -size,   size,  size, -size,
      -size, -size, -size,   size,  size, -size,   size, -size, -size,
      -size,  size, -size,  -size,  size,  size,   size,  size,  size,
      -size,  size, -size,   size,  size,  size,   size,  size, -size,
      -size, -size, -size,   size, -size, -size,   size, -size,  size,
      -size, -size, -size,   size, -size,  size,  -size, -size,  size,
       size, -size, -size,   size,  size, -size,   size,  size,  size,
       size, -size, -size,   size,  size,  size,   size, -size,  size,
      -size, -size, -size,  -size, -size,  size,  -size,  size,  size,
      -size, -size, -size,  -size,  size,  size,  -size,  size, -size,
    ]);

    const colors = new Float32Array([
      r, g, b,  r, g, b,  r, g, b,  r, g, b,  r, g, b,  r, g, b,
      r*0.5, g*0.5, b,  r*0.5, g*0.5, b,  r*0.5, g*0.5, b,  r*0.5, g*0.5, b,  r*0.5, g*0.5, b,  r*0.5, g*0.5, b,
      0.1, yieldValue/20, 0.1,  0.1, yieldValue/20, 0.1,  0.1, yieldValue/20, 0.1,
      0.1, yieldValue/20, 0.1,  0.1, yieldValue/20, 0.1,  0.1, yieldValue/20, 0.1,
      score/10, score/10, 0,  score/10, score/10, 0,  score/10, score/10, 0,
      score/10, score/10, 0,  score/10, score/10, 0,  score/10, score/10, 0,
      r*0.7, g*0.7, b*1.2,  r*0.7, g*0.7, b*1.2,  r*0.7, g*0.7, b*1.2,
      r*0.7, g*0.7, b*1.2,  r*0.7, g*0.7, b*1.2,  r*0.7, g*0.7, b*1.2,
      r*0.7, g*0.7, b*0.8,  r*0.7, g*0.7, b*0.8,  r*0.7, g*0.7, b*0.8,
      r*0.7, g*0.7, b*0.8,  r*0.7, g*0.7, b*0.8,  r*0.7, g*0.7, b*0.8,
    ]);

    const vsSource = `
      attribute vec3 position;
      attribute vec3 color;
      varying vec3 vColor;
      uniform float uTime;
      uniform float uRotationSpeed;
      
      void main() {
        vColor = color;
        float c = cos(uTime * uRotationSpeed);
        float s = sin(uTime * uRotationSpeed);
        mat3 rotY = mat3(
          c, 0.0, s,
          0.0, 1.0, 0.0,
          -s, 0.0, c
        );
        float tilt = 0.3;
        mat3 rotX = mat3(
          1.0, 0.0, 0.0,
          0.0, cos(tilt), -sin(tilt),
          0.0, sin(tilt), cos(tilt)
        );
        vec3 rotated = rotX * rotY * position;
        gl_Position = vec4(rotated * 0.8, 1.0);
      }
    `;

    const fsSource = `
      precision mediump float;
      varying vec3 vColor;
      void main() {
        gl_FragColor = vec4(vColor, 0.9);
      }
    `;

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program error:", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    const colorLoc = gl.getAttribLocation(program, "color");
    gl.enableVertexAttribArray(colorLoc);
    gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, "uTime");
    const speedLoc = gl.getUniformLocation(program, "uRotationSpeed");
    const rotationSpeed = Math.max(0.2, Math.min(2.0, 2.0 - score / 5));

    let startTime = performance.now();
    let animationId: number;

    const render = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      gl.uniform1f(timeLoc, elapsed);
      gl.uniform1f(speedLoc, rotationSpeed);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 36);
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(posBuffer);
      gl.deleteBuffer(colorBuffer);
    };
  }, [variance, yieldValue, score, propertyType]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block"
      style={{ background: "transparent" }}
    />
  );
}