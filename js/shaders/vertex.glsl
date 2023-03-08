uniform float time;
uniform float uProgress;
uniform vec2 uResolution;
uniform vec2 uQuadSize;
uniform vec4 uCorners;

varying vec2 vUv;
varying vec2 vSize;

void main(){
  float PI = 3.1415926535897932384626433832795;
  vUv = uv;
  float sine = sin(PI*uProgress);
  // create a wave effect taking the length of the uv
  // decrease the number of waves by changing the 15. to a higher or lawer number
  float waves = sine*0.1*sin(5.*length(uv) + 15.*uProgress);
  // set the position to the center of the screen
  vec4 defaultState = modelMatrix * vec4(position, 1.0);
  vec4 fullScreenState = vec4( position, 1.0 );
  // scale the postion to the size of the width and height of the screen
  fullScreenState.x *= uResolution.x/uQuadSize.x;
  fullScreenState.y *= uResolution.y/uQuadSize.y;
  float cornersProgress = mix(
    mix(uCorners.z,uCorners.w,uv.x),
    mix(uCorners.x,uCorners.y,uv.x),
    uv.y
  );

  vec4 finalState = mix(defaultState, fullScreenState, uProgress + waves);

  // get the step of the quad on each step of the animation
  vSize = mix(uQuadSize, uResolution, uProgress);
  
  gl_Position = projectionMatrix * viewMatrix * finalState;
}