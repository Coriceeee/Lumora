export function HealingGroundComponent() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[16, 64]} /> 
      <meshStandardMaterial color="#f0efe8" />
    </mesh>
  );
}
