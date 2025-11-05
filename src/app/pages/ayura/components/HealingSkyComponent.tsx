import * as THREE from "three";
import { useMemo } from "react";

export function HealingSkyComponent({ timeOfDay }: { timeOfDay: number }) {
  const top = new THREE.Color().setHSL(0.6, 0.4, THREE.MathUtils.lerp(0.35, 0.7, timeOfDay));
  const bottom = new THREE.Color().setHSL(0.08, 0.6, THREE.MathUtils.lerp(0.95, 0.7, timeOfDay));
  const geo = useMemo(() => new THREE.SphereGeometry(60, 32, 16), []);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        uniforms: { topColor: { value: top }, bottomColor: { value: bottom } },
        vertexShader: `varying vec3 vPos; void main(){ vPos=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
        fragmentShader: `uniform vec3 topColor; uniform vec3 bottomColor; varying vec3 vPos; void main(){ float h=normalize(vPos).y*0.5+0.5; gl_FragColor=vec4(mix(bottomColor,topColor,h),1.0); }`,
      }),
    [timeOfDay]
  );
  return <mesh geometry={geo} material={mat} />;
}
