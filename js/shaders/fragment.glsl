uniform float time;
uniform float uProgress;
uniform vec2 uTextureSize;
uniform sampler2D uTexture;

varying vec2 vUv;
varying vec2 vSize;

// this funcction rescale the uv coordinates to fit the quad
vec2 getUV(vec2 uv, vec2 textureSize, vec2 quadSize){
    vec2 tempUV = uv - vec2(0.5);

    // get the aspect ratio of the quad and the texture
    float quadAspect = quadSize.x/quadSize.y;
    float textureAspect = textureSize.x/textureSize.y;
    
    // how to implement background-size: cover; in webgl
    if(quadAspect<textureAspect){
        tempUV = tempUV*vec2(quadAspect/textureAspect,1.);
    } else{
        tempUV = tempUV*vec2(1.,textureAspect/quadAspect);
    }

    tempUV += vec2(0.5);
    return tempUV;
}

void main(){
    // the texture stays in the center
    // vec2 newUV = (vUv - vec2(0.5))*vec2(2.,1.) + vec2(0.5);
    // the texture don't stay in the center
    // vec2 newUV = vUv*2.;
    // vec4 image = texture(uTexture, vUv);
    vec2 correctUV = getUV(vUv, uTextureSize, vSize);
    vec4 image = texture2D(uTexture, correctUV);
    // gl_FragColor = vec4( vUv, 0.0, 1.0);
    gl_FragColor = image;
}