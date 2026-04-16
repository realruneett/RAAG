uniform vec3 uColorA; // High-frequency color
uniform vec3 uColorB; // Low-frequency color
uniform float uTime;

varying vec3 vNormal;
varying vec3 vPosition;
varying float vIntensity;

void main() {
    // Map intensity (0-1) to the color gradient
    vec3 baseColor = mix(uColorB, uColorA, vIntensity);
    
    // Fresnel-like rim lighting for luminous effect
    float rim = 1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0);
    rim = pow(rim, 3.0);
    
    // Pulse low frequencies slightly in the glow
    float glow = (0.5 + 0.5 * sin(uTime * 2.0)) * vIntensity;
    
    vec3 finalColor = baseColor + rim * baseColor * 2.0 + (glow * 0.2);
    
    // Abyssal Transparency
    float alpha = 0.4 + vIntensity * 0.6;
    
    gl_FragColor = vec4(finalColor, alpha);
}
