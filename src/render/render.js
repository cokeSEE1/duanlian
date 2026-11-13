function Ty() {
  let i = null,
    e = !1,
    t = null,
    n = null;
  function s(o, r) {
    t(o, r), (n = i.requestAnimationFrame(s));
  }
  return {
    start: function () {
      e !== !0 && t !== null && ((n = i.requestAnimationFrame(s)), (e = !0));
    },
    stop: function () {
      i.cancelAnimationFrame(n), (e = !1);
    },
    setAnimationLoop: function (o) {
      t = o;
    },
    setContext: function (o) {
      i = o;
    },
  };
}
function p4(i) {
  let e = new WeakMap();
  function t(a, l) {
    let c = a.array,
      u = a.usage,
      h = c.byteLength,
      f = i.createBuffer();
    i.bindBuffer(l, f), i.bufferData(l, c, u), a.onUploadCallback();
    let p;
    if (c instanceof Float32Array) p = i.FLOAT;
    else if (typeof Float16Array < "u" && c instanceof Float16Array) p = i.HALF_FLOAT;
    else if (c instanceof Uint16Array)
      a.isFloat16BufferAttribute ? (p = i.HALF_FLOAT) : (p = i.UNSIGNED_SHORT);
    else if (c instanceof Int16Array) p = i.SHORT;
    else if (c instanceof Uint32Array) p = i.UNSIGNED_INT;
    else if (c instanceof Int32Array) p = i.INT;
    else if (c instanceof Int8Array) p = i.BYTE;
    else if (c instanceof Uint8Array) p = i.UNSIGNED_BYTE;
    else if (c instanceof Uint8ClampedArray) p = i.UNSIGNED_BYTE;
    else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: " + c);
    return {
      buffer: f,
      type: p,
      bytesPerElement: c.BYTES_PER_ELEMENT,
      version: a.version,
      size: h,
    };
  }
  function n(a, l, c) {
    let u = l.array,
      h = l.updateRanges;
    if ((i.bindBuffer(c, a), h.length === 0)) i.bufferSubData(c, 0, u);
    else {
      h.sort((p, d) => p.start - d.start);
      let f = 0;
      for (let p = 1; p < h.length; p++) {
        let d = h[f],
          v = h[p];
        v.start <= d.start + d.count + 1
          ? (d.count = Math.max(d.count, v.start + v.count - d.start))
          : (++f, (h[f] = v));
      }
      h.length = f + 1;
      for (let p = 0, d = h.length; p < d; p++) {
        let v = h[p];
        i.bufferSubData(c, v.start * u.BYTES_PER_ELEMENT, u, v.start, v.count);
      }
      l.clearUpdateRanges();
    }
    l.onUploadCallback();
  }
  function s(a) {
    return a.isInterleavedBufferAttribute && (a = a.data), e.get(a);
  }
  function o(a) {
    a.isInterleavedBufferAttribute && (a = a.data);
    let l = e.get(a);
    l && (i.deleteBuffer(l.buffer), e.delete(a));
  }
  function r(a, l) {
    if ((a.isInterleavedBufferAttribute && (a = a.data), a.isGLBufferAttribute)) {
      let u = e.get(a);
      (!u || u.version < a.version) &&
        e.set(a, {
          buffer: a.buffer,
          type: a.type,
          bytesPerElement: a.elementSize,
          version: a.version,
        });
      return;
    }
    let c = e.get(a);
    if (c === void 0) e.set(a, t(a, l));
    else if (c.version < a.version) {
      if (c.size !== a.array.byteLength)
        throw new Error(
          "THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.",
        );
      n(c.buffer, a, l), (c.version = a.version);
    }
  }
  return { get: s, remove: o, update: r };
}
var m4 = `#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,
  g4 = `#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,
  v4 = `#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,
  x4 = `#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,
  y4 = `#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,
  b4 = `#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,
  _4 = `#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,
  M4 = `#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,
  w4 = `#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,
  E4 = `#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,
  S4 = `vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,
  T4 = `vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,
  A4 = `float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,
  R4 = `#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,
  C4 = `#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,
  P4 = `#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,
  I4 = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,
  z4 = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,
  D4 = `#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,
  L4 = `#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,
  k4 = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,
  F4 = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,
  U4 = `#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,
  N4 = `#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,
  B4 = `#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,
  O4 = `vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,
  H4 = `#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,
  V4 = `#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,
  W4 = `#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,
  G4 = `#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,
  q4 = "gl_FragColor = linearToOutputTexel( gl_FragColor );",
  X4 = `vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,
  Y4 = `#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,
  $4 = `#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,
  Z4 = `#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,
  j4 = `#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,
  J4 = `#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,
  K4 = `#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,
  Q4 = `#ifdef USE_FOG
	varying float vFogDepth;
#endif`,
  eE = `#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,
  tE = `#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,
  nE = `#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,
  iE = `#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,
  sE = `LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,
  oE = `varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,
  rE = `uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,
  aE = `#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,
  lE = `ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,
  cE = `varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,
  uE = `BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,
  hE = `varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,
  fE = `PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,
  dE = `struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
  float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
  float x2 = x * x;
  float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
  return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,
  pE = `
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,
  mE = `#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,
  gE = `#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,
  vE = `#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,
  xE = `#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,
  yE = `#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,
  bE = `#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,
  _E = `#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,
  ME = `#ifdef USE_MAP
	uniform sampler2D map;
#endif`,
  wE = `#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,
  EE = `#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,
  SE = `float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,
  TE = `#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,
  AE = `#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,
  RE = `#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,
  CE = `#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,
  PE = `#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,
  IE = `#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,
  zE = `float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,
  DE = `#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,
  LE = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,
  kE = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,
  FE = `#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,
  UE = `#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,
  NE = `#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,
  BE = `#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,
  OE = `#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,
  HE = `#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,
  VE = `#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,
  WE = `vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,
  GE = `#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,
  qE = `vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,
  XE = `#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,
  YE = `#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,
  $E = `float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,
  ZE = `#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,
  jE = `#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,
  JE = `#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,
  KE = `#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,
  QE = `float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,
  eS = `#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,
  tS = `#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,
  nS = `#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,
  iS = `#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,
  sS = `float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,
  oS = `#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,
  rS = `#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,
  aS = `#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,
  lS = `#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,
  cS = `#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,
  uS = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,
  hS = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,
  fS = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,
  dS = `#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,
  pS = `varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,
  mS = `uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,
  gS = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,
  vS = `#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,
  xS = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,
  yS = `uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,
  bS = `#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,
  _S = `#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,
  MS = `#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,
  wS = `#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,
  ES = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,
  SS = `uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,
  TS = `uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,
  AS = `uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,
  RS = `#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,
  CS = `uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  PS = `#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
  IS = `#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  zS = `#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,
  DS = `#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  LS = `#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,
  kS = `#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,
  FS = `#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
  US = `#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  NS = `#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,
  BS = `#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  OS = `#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
  HS = `#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  VS = `uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,
  WS = `uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,
  GS = `#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
  qS = `uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,
  XS = `uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,
  YS = `uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,
  It = {
    alphahash_fragment: m4,
    alphahash_pars_fragment: g4,
    alphamap_fragment: v4,
    alphamap_pars_fragment: x4,
    alphatest_fragment: y4,
    alphatest_pars_fragment: b4,
    aomap_fragment: _4,
    aomap_pars_fragment: M4,
    batching_pars_vertex: w4,
    batching_vertex: E4,
    begin_vertex: S4,
    beginnormal_vertex: T4,
    bsdfs: A4,
    iridescence_fragment: R4,
    bumpmap_pars_fragment: C4,
    clipping_planes_fragment: P4,
    clipping_planes_pars_fragment: I4,
    clipping_planes_pars_vertex: z4,
    clipping_planes_vertex: D4,
    color_fragment: L4,
    color_pars_fragment: k4,
    color_pars_vertex: F4,
    color_vertex: U4,
    common: N4,
    cube_uv_reflection_fragment: B4,
    defaultnormal_vertex: O4,
    displacementmap_pars_vertex: H4,
    displacementmap_vertex: V4,
    emissivemap_fragment: W4,
    emissivemap_pars_fragment: G4,
    colorspace_fragment: q4,
    colorspace_pars_fragment: X4,
    envmap_fragment: Y4,
    envmap_common_pars_fragment: $4,
    envmap_pars_fragment: Z4,
    envmap_pars_vertex: j4,
    envmap_physical_pars_fragment: aE,
    envmap_vertex: J4,
    fog_vertex: K4,
    fog_pars_vertex: Q4,
    fog_fragment: eE,
    fog_pars_fragment: tE,
    gradientmap_pars_fragment: nE,
    lightmap_pars_fragment: iE,
    lights_lambert_fragment: sE,
    lights_lambert_pars_fragment: oE,
    lights_pars_begin: rE,
    lights_toon_fragment: lE,
    lights_toon_pars_fragment: cE,
    lights_phong_fragment: uE,
    lights_phong_pars_fragment: hE,
    lights_physical_fragment: fE,
    lights_physical_pars_fragment: dE,
    lights_fragment_begin: pE,
    lights_fragment_maps: mE,
    lights_fragment_end: gE,
    logdepthbuf_fragment: vE,
    logdepthbuf_pars_fragment: xE,
    logdepthbuf_pars_vertex: yE,
    logdepthbuf_vertex: bE,
    map_fragment: _E,
    map_pars_fragment: ME,
    map_particle_fragment: wE,
    map_particle_pars_fragment: EE,
    metalnessmap_fragment: SE,
    metalnessmap_pars_fragment: TE,
    morphinstance_vertex: AE,
    morphcolor_vertex: RE,
    morphnormal_vertex: CE,
    morphtarget_pars_vertex: PE,
    morphtarget_vertex: IE,
    normal_fragment_begin: zE,
    normal_fragment_maps: DE,
    normal_pars_fragment: LE,
    normal_pars_vertex: kE,
    normal_vertex: FE,
    normalmap_pars_fragment: UE,
    clearcoat_normal_fragment_begin: NE,
    clearcoat_normal_fragment_maps: BE,
    clearcoat_pars_fragment: OE,
    iridescence_pars_fragment: HE,
    opaque_fragment: VE,
    packing: WE,
    premultiplied_alpha_fragment: GE,
    project_vertex: qE,
    dithering_fragment: XE,
    dithering_pars_fragment: YE,
    roughnessmap_fragment: $E,
    roughnessmap_pars_fragment: ZE,
    shadowmap_pars_fragment: jE,
    shadowmap_pars_vertex: JE,
    shadowmap_vertex: KE,
    shadowmask_pars_fragment: QE,
    skinbase_vertex: eS,
    skinning_pars_vertex: tS,
    skinning_vertex: nS,
    skinnormal_vertex: iS,
    specularmap_fragment: sS,
    specularmap_pars_fragment: oS,
    tonemapping_fragment: rS,
    tonemapping_pars_fragment: aS,
    transmission_fragment: lS,
    transmission_pars_fragment: cS,
    uv_pars_fragment: uS,
    uv_pars_vertex: hS,
    uv_vertex: fS,
    worldpos_vertex: dS,
    background_vert: pS,
    background_frag: mS,
    backgroundCube_vert: gS,
    backgroundCube_frag: vS,
    cube_vert: xS,
    cube_frag: yS,
    depth_vert: bS,
    depth_frag: _S,
    distanceRGBA_vert: MS,
    distanceRGBA_frag: wS,
    equirect_vert: ES,
    equirect_frag: SS,
    linedashed_vert: TS,
    linedashed_frag: AS,
    meshbasic_vert: RS,
    meshbasic_frag: CS,
    meshlambert_vert: PS,
    meshlambert_frag: IS,
    meshmatcap_vert: zS,
    meshmatcap_frag: DS,
    meshnormal_vert: LS,
    meshnormal_frag: kS,
    meshphong_vert: FS,
    meshphong_frag: US,
    meshphysical_vert: NS,
    meshphysical_frag: BS,
    meshtoon_vert: OS,
    meshtoon_frag: HS,
    points_vert: VS,
    points_frag: WS,
    shadow_vert: GS,
    shadow_frag: qS,
    sprite_vert: XS,
    sprite_frag: YS,
  },
  st = {
    common: {
      diffuse: { value: new Ve(16777215) },
      opacity: { value: 1 },
      map: { value: null },
      mapTransform: { value: new kt() },
      alphaMap: { value: null },
      alphaMapTransform: { value: new kt() },
      alphaTest: { value: 0 },
    },
    specularmap: { specularMap: { value: null }, specularMapTransform: { value: new kt() } },
    envmap: {
      envMap: { value: null },
      envMapRotation: { value: new kt() },
      flipEnvMap: { value: -1 },
      reflectivity: { value: 1 },
      ior: { value: 1.5 },
      refractionRatio: { value: 0.98 },
    },
    aomap: {
      aoMap: { value: null },
      aoMapIntensity: { value: 1 },
      aoMapTransform: { value: new kt() },
    },
    lightmap: {
      lightMap: { value: null },
      lightMapIntensity: { value: 1 },
      lightMapTransform: { value: new kt() },
    },
    bumpmap: {
      bumpMap: { value: null },
      bumpMapTransform: { value: new kt() },
      bumpScale: { value: 1 },
    },
    normalmap: {
      normalMap: { value: null },
      normalMapTransform: { value: new kt() },
      normalScale: { value: new Ae(1, 1) },
    },
    displacementmap: {
      displacementMap: { value: null },
      displacementMapTransform: { value: new kt() },
      displacementScale: { value: 1 },
      displacementBias: { value: 0 },
    },
    emissivemap: { emissiveMap: { value: null }, emissiveMapTransform: { value: new kt() } },
    metalnessmap: { metalnessMap: { value: null }, metalnessMapTransform: { value: new kt() } },
    roughnessmap: { roughnessMap: { value: null }, roughnessMapTransform: { value: new kt() } },
    gradientmap: { gradientMap: { value: null } },
    fog: {
      fogDensity: { value: 25e-5 },
      fogNear: { value: 1 },
      fogFar: { value: 2e3 },
      fogColor: { value: new Ve(16777215) },
    },
    lights: {
      ambientLightColor: { value: [] },
      lightProbe: { value: [] },
      directionalLights: { value: [], properties: { direction: {}, color: {} } },
      directionalLightShadows: {
        value: [],
        properties: {
          shadowIntensity: 1,
          shadowBias: {},
          shadowNormalBias: {},
          shadowRadius: {},
          shadowMapSize: {},
        },
      },
      directionalShadowMap: { value: [] },
      directionalShadowMatrix: { value: [] },
      spotLights: {
        value: [],
        properties: {
          color: {},
          position: {},
          direction: {},
          distance: {},
          coneCos: {},
          penumbraCos: {},
          decay: {},
        },
      },
      spotLightShadows: {
        value: [],
        properties: {
          shadowIntensity: 1,
          shadowBias: {},
          shadowNormalBias: {},
          shadowRadius: {},
          shadowMapSize: {},
        },
      },
      spotLightMap: { value: [] },
      spotShadowMap: { value: [] },
      spotLightMatrix: { value: [] },
      pointLights: {
        value: [],
        properties: { color: {}, position: {}, decay: {}, distance: {} },
      },
      pointLightShadows: {
        value: [],
        properties: {
          shadowIntensity: 1,
          shadowBias: {},
          shadowNormalBias: {},
          shadowRadius: {},
          shadowMapSize: {},
          shadowCameraNear: {},
          shadowCameraFar: {},
        },
      },
      pointShadowMap: { value: [] },
      pointShadowMatrix: { value: [] },
      hemisphereLights: {
        value: [],
        properties: { direction: {}, skyColor: {}, groundColor: {} },
      },
      rectAreaLights: {
        value: [],
        properties: { color: {}, position: {}, width: {}, height: {} },
      },
      ltc_1: { value: null },
      ltc_2: { value: null },
    },
    points: {
      diffuse: { value: new Ve(16777215) },
      opacity: { value: 1 },
      size: { value: 1 },
      scale: { value: 1 },
      map: { value: null },
      alphaMap: { value: null },
      alphaMapTransform: { value: new kt() },
      alphaTest: { value: 0 },
      uvTransform: { value: new kt() },
    },
    sprite: {
      diffuse: { value: new Ve(16777215) },
      opacity: { value: 1 },
      center: { value: new Ae(0.5, 0.5) },
      rotation: { value: 0 },
      map: { value: null },
      mapTransform: { value: new kt() },
      alphaMap: { value: null },
      alphaMapTransform: { value: new kt() },
      alphaTest: { value: 0 },
    },
  },
  fr = {
    basic: {
      uniforms: _s([st.common, st.specularmap, st.envmap, st.aomap, st.lightmap, st.fog]),
      vertexShader: It.meshbasic_vert,
      fragmentShader: It.meshbasic_frag,
    },
    lambert: {
      uniforms: _s([
        st.common,
        st.specularmap,
        st.envmap,
        st.aomap,
        st.lightmap,
        st.emissivemap,
        st.bumpmap,
        st.normalmap,
        st.displacementmap,
        st.fog,
        st.lights,
        { emissive: { value: new Ve(0) } },
      ]),
      vertexShader: It.meshlambert_vert,
      fragmentShader: It.meshlambert_frag,
    },
    phong: {
      uniforms: _s([
        st.common,
        st.specularmap,
        st.envmap,
        st.aomap,
        st.lightmap,
        st.emissivemap,
        st.bumpmap,
        st.normalmap,
        st.displacementmap,
        st.fog,
        st.lights,
        {
          emissive: { value: new Ve(0) },
          specular: { value: new Ve(1118481) },
          shininess: { value: 30 },
        },
      ]),
      vertexShader: It.meshphong_vert,
      fragmentShader: It.meshphong_frag,
    },
    standard: {
      uniforms: _s([
        st.common,
        st.envmap,
        st.aomap,
        st.lightmap,
        st.emissivemap,
        st.bumpmap,
        st.normalmap,
        st.displacementmap,
        st.roughnessmap,
        st.metalnessmap,
        st.fog,
        st.lights,
        {
          emissive: { value: new Ve(0) },
          roughness: { value: 1 },
          metalness: { value: 0 },
          envMapIntensity: { value: 1 },
        },
      ]),
      vertexShader: It.meshphysical_vert,
      fragmentShader: It.meshphysical_frag,
    },
    toon: {
      uniforms: _s([
        st.common,
        st.aomap,
        st.lightmap,
        st.emissivemap,
        st.bumpmap,
        st.normalmap,
        st.displacementmap,
        st.gradientmap,
        st.fog,
        st.lights,
        { emissive: { value: new Ve(0) } },
      ]),
      vertexShader: It.meshtoon_vert,
      fragmentShader: It.meshtoon_frag,
    },
    matcap: {
      uniforms: _s([
        st.common,
        st.bumpmap,
        st.normalmap,
        st.displacementmap,
        st.fog,
        { matcap: { value: null } },
      ]),
      vertexShader: It.meshmatcap_vert,
      fragmentShader: It.meshmatcap_frag,
    },
    points: {
      uniforms: _s([st.points, st.fog]),
      vertexShader: It.points_vert,
      fragmentShader: It.points_frag,
    },
    dashed: {
      uniforms: _s([
        st.common,
        st.fog,
        { scale: { value: 1 }, dashSize: { value: 1 }, totalSize: { value: 2 } },
      ]),
      vertexShader: It.linedashed_vert,
      fragmentShader: It.linedashed_frag,
    },
    depth: {
      uniforms: _s([st.common, st.displacementmap]),
      vertexShader: It.depth_vert,
      fragmentShader: It.depth_frag,
    },
    normal: {
      uniforms: _s([
        st.common,
        st.bumpmap,
        st.normalmap,
        st.displacementmap,
        { opacity: { value: 1 } },
      ]),
      vertexShader: It.meshnormal_vert,
      fragmentShader: It.meshnormal_frag,
    },
    sprite: {
      uniforms: _s([st.sprite, st.fog]),
      vertexShader: It.sprite_vert,
      fragmentShader: It.sprite_frag,
    },
    background: {
      uniforms: {
        uvTransform: { value: new kt() },
        t2D: { value: null },
        backgroundIntensity: { value: 1 },
      },
      vertexShader: It.background_vert,
      fragmentShader: It.background_frag,
    },
    backgroundCube: {
      uniforms: {
        envMap: { value: null },
        flipEnvMap: { value: -1 },
        backgroundBlurriness: { value: 0 },
        backgroundIntensity: { value: 1 },
        backgroundRotation: { value: new kt() },
      },
      vertexShader: It.backgroundCube_vert,
      fragmentShader: It.backgroundCube_frag,
    },
    cube: {
      uniforms: { tCube: { value: null }, tFlip: { value: -1 }, opacity: { value: 1 } },
      vertexShader: It.cube_vert,
      fragmentShader: It.cube_frag,
    },
    equirect: {
      uniforms: { tEquirect: { value: null } },
      vertexShader: It.equirect_vert,
      fragmentShader: It.equirect_frag,
    },
    distanceRGBA: {
      uniforms: _s([
        st.common,
        st.displacementmap,
        {
          referencePosition: { value: new W() },
          nearDistance: { value: 1 },
          farDistance: { value: 1e3 },
        },
      ]),
      vertexShader: It.distanceRGBA_vert,
      fragmentShader: It.distanceRGBA_frag,
    },
    shadow: {
      uniforms: _s([st.lights, st.fog, { color: { value: new Ve(0) }, opacity: { value: 1 } }]),
      vertexShader: It.shadow_vert,
      fragmentShader: It.shadow_frag,
    },
  };
fr.physical = {
  uniforms: _s([
    fr.standard.uniforms,
    {
      clearcoat: { value: 0 },
      clearcoatMap: { value: null },
      clearcoatMapTransform: { value: new kt() },
      clearcoatNormalMap: { value: null },
      clearcoatNormalMapTransform: { value: new kt() },
      clearcoatNormalScale: { value: new Ae(1, 1) },
      clearcoatRoughness: { value: 0 },
      clearcoatRoughnessMap: { value: null },
      clearcoatRoughnessMapTransform: { value: new kt() },
      dispersion: { value: 0 },
      iridescence: { value: 0 },
      iridescenceMap: { value: null },
      iridescenceMapTransform: { value: new kt() },
      iridescenceIOR: { value: 1.3 },
      iridescenceThicknessMinimum: { value: 100 },
      iridescenceThicknessMaximum: { value: 400 },
      iridescenceThicknessMap: { value: null },
      iridescenceThicknessMapTransform: { value: new kt() },
      sheen: { value: 0 },
      sheenColor: { value: new Ve(0) },
      sheenColorMap: { value: null },
      sheenColorMapTransform: { value: new kt() },
      sheenRoughness: { value: 1 },
      sheenRoughnessMap: { value: null },
      sheenRoughnessMapTransform: { value: new kt() },
      transmission: { value: 0 },
      transmissionMap: { value: null },
      transmissionMapTransform: { value: new kt() },
      transmissionSamplerSize: { value: new Ae() },
      transmissionSamplerMap: { value: null },
      thickness: { value: 0 },
      thicknessMap: { value: null },
      thicknessMapTransform: { value: new kt() },
      attenuationDistance: { value: 0 },
      attenuationColor: { value: new Ve(0) },
      specularColor: { value: new Ve(1, 1, 1) },
      specularColorMap: { value: null },
      specularColorMapTransform: { value: new kt() },
      specularIntensity: { value: 1 },
      specularIntensityMap: { value: null },
      specularIntensityMapTransform: { value: new kt() },
      anisotropyVector: { value: new Ae() },
      anisotropyMap: { value: null },
      anisotropyMapTransform: { value: new kt() },
    },
  ]),
  vertexShader: It.meshphysical_vert,
  fragmentShader: It.meshphysical_frag,
};
var Kp = { r: 0, b: 0, g: 0 },
  Q0 = new In(),
  $S = new Ye();
function ZS(i, e, t, n, s, o, r) {
  let a = new Ve(0),
    l = o === !0 ? 0 : 1,
    c,
    u,
    h = null,
    f = 0,
    p = null;
  function d(b) {
    let m = b.isScene === !0 ? b.background : null;
    return m && m.isTexture && (m = (b.backgroundBlurriness > 0 ? t : e).get(m)), m;
  }
  function v(b) {
    let m = !1,
      A = d(b);
    A === null ? x(a, l) : A && A.isColor && (x(A, 1), (m = !0));
    let _ = i.xr.getEnvironmentBlendMode();
    _ === "additive"
      ? n.buffers.color.setClear(0, 0, 0, 1, r)
      : _ === "alpha-blend" && n.buffers.color.setClear(0, 0, 0, 0, r),
      (i.autoClear || m) &&
        (n.buffers.depth.setTest(!0),
        n.buffers.depth.setMask(!0),
        n.buffers.color.setMask(!0),
        i.clear(i.autoClearColor, i.autoClearDepth, i.autoClearStencil));
  }
  function g(b, m) {
    let A = d(m);
    A && (A.isCubeTexture || A.mapping === X0)
      ? (u === void 0 &&
          ((u = new Qe(
            new un(1, 1, 1),
            new zn({
              name: "BackgroundCubeMaterial",
              uniforms: K0(fr.backgroundCube.uniforms),
              vertexShader: fr.backgroundCube.vertexShader,
              fragmentShader: fr.backgroundCube.fragmentShader,
              side: Ki,
              depthTest: !1,
              depthWrite: !1,
              fog: !1,
              allowOverride: !1,
            }),
          )),
          u.geometry.deleteAttribute("normal"),
          u.geometry.deleteAttribute("uv"),
          (u.onBeforeRender = function (_, M, E) {
            this.matrixWorld.copyPosition(E.matrixWorld);
          }),
          Object.defineProperty(u.material, "envMap", {
            get: function () {
              return this.uniforms.envMap.value;
            },
          }),
          s.update(u)),
        Q0.copy(m.backgroundRotation),
        (Q0.x *= -1),
        (Q0.y *= -1),
        (Q0.z *= -1),
        A.isCubeTexture && A.isRenderTargetTexture === !1 && ((Q0.y *= -1), (Q0.z *= -1)),
        (u.material.uniforms.envMap.value = A),
        (u.material.uniforms.flipEnvMap.value =
          A.isCubeTexture && A.isRenderTargetTexture === !1 ? -1 : 1),
        (u.material.uniforms.backgroundBlurriness.value = m.backgroundBlurriness),
        (u.material.uniforms.backgroundIntensity.value = m.backgroundIntensity),
        u.material.uniforms.backgroundRotation.value.setFromMatrix4($S.makeRotationFromEuler(Q0)),
        (u.material.toneMapped = Kt.getTransfer(A.colorSpace) !== bn),
        (h !== A || f !== A.version || p !== i.toneMapping) &&
          ((u.material.needsUpdate = !0), (h = A), (f = A.version), (p = i.toneMapping)),
        u.layers.enableAll(),
        b.unshift(u, u.geometry, u.material, 0, 0, null))
      : A &&
        A.isTexture &&
        (c === void 0 &&
          ((c = new Qe(
            new rn(2, 2),
            new zn({
              name: "BackgroundMaterial",
              uniforms: K0(fr.background.uniforms),
              vertexShader: fr.background.vertexShader,
              fragmentShader: fr.background.fragmentShader,
              side: wr,
              depthTest: !1,
              depthWrite: !1,
              fog: !1,
              allowOverride: !1,
            }),
          )),
          c.geometry.deleteAttribute("normal"),
          Object.defineProperty(c.material, "map", {
            get: function () {
              return this.uniforms.t2D.value;
            },
          }),
          s.update(c)),
        (c.material.uniforms.t2D.value = A),
        (c.material.uniforms.backgroundIntensity.value = m.backgroundIntensity),
        (c.material.toneMapped = Kt.getTransfer(A.colorSpace) !== bn),
        A.matrixAutoUpdate === !0 && A.updateMatrix(),
        c.material.uniforms.uvTransform.value.copy(A.matrix),
        (h !== A || f !== A.version || p !== i.toneMapping) &&
          ((c.material.needsUpdate = !0), (h = A), (f = A.version), (p = i.toneMapping)),
        c.layers.enableAll(),
        b.unshift(c, c.geometry, c.material, 0, 0, null));
  }
  function x(b, m) {
    b.getRGB(Kp, pg(i)), n.buffers.color.setClear(Kp.r, Kp.g, Kp.b, m, r);
  }
  function y() {
    u !== void 0 && (u.geometry.dispose(), u.material.dispose(), (u = void 0)),
      c !== void 0 && (c.geometry.dispose(), c.material.dispose(), (c = void 0));
  }
  return {
    getClearColor: function () {
      return a;
    },
    setClearColor: function (b, m = 1) {
      a.set(b), (l = m), x(a, l);
    },
    getClearAlpha: function () {
      return l;
    },
    setClearAlpha: function (b) {
      (l = b), x(a, l);
    },
    render: v,
    addToRenderList: g,
    dispose: y,
  };
}
function jS(i, e) {
  let t = i.getParameter(i.MAX_VERTEX_ATTRIBS),
    n = {},
    s = f(null),
    o = s,
    r = !1;
  function a(S, z, H, O, q) {
    let U = !1,
      T = h(O, H, z);
    o !== T && ((o = T), c(o.object)),
      (U = p(S, O, H, q)),
      U && d(S, O, H, q),
      q !== null && e.update(q, i.ELEMENT_ARRAY_BUFFER),
      (U || r) &&
        ((r = !1),
        m(S, z, H, O),
        q !== null && i.bindBuffer(i.ELEMENT_ARRAY_BUFFER, e.get(q).buffer));
  }
  function l() {
    return i.createVertexArray();
  }
  function c(S) {
    return i.bindVertexArray(S);
  }
  function u(S) {
    return i.deleteVertexArray(S);
  }
  function h(S, z, H) {
    let O = H.wireframe === !0,
      q = n[S.id];
    q === void 0 && ((q = {}), (n[S.id] = q));
    let U = q[z.id];
    U === void 0 && ((U = {}), (q[z.id] = U));
    let T = U[O];
    return T === void 0 && ((T = f(l())), (U[O] = T)), T;
  }
  function f(S) {
    let z = [],
      H = [],
      O = [];
    for (let q = 0; q < t; q++) (z[q] = 0), (H[q] = 0), (O[q] = 0);
    return {
      geometry: null,
      program: null,
      wireframe: !1,
      newAttributes: z,
      enabledAttributes: H,
      attributeDivisors: O,
      object: S,
      attributes: {},
      index: null,
    };
  }
  function p(S, z, H, O) {
    let q = o.attributes,
      U = z.attributes,
      T = 0,
      D = H.getAttributes();
    for (let C in D)
      if (D[C].location >= 0) {
        let j = q[C],
          N = U[C];
        if (
          (N === void 0 &&
            (C === "instanceMatrix" && S.instanceMatrix && (N = S.instanceMatrix),
            C === "instanceColor" && S.instanceColor && (N = S.instanceColor)),
          j === void 0 || j.attribute !== N || (N && j.data !== N.data))
        )
          return !0;
        T++;
      }
    return o.attributesNum !== T || o.index !== O;
  }
  function d(S, z, H, O) {
    let q = {},
      U = z.attributes,
      T = 0,
      D = H.getAttributes();
    for (let C in D)
      if (D[C].location >= 0) {
        let j = U[C];
        j === void 0 &&
          (C === "instanceMatrix" && S.instanceMatrix && (j = S.instanceMatrix),
          C === "instanceColor" && S.instanceColor && (j = S.instanceColor));
        let N = {};
        (N.attribute = j), j && j.data && (N.data = j.data), (q[C] = N), T++;
      }
    (o.attributes = q), (o.attributesNum = T), (o.index = O);
  }
  function v() {
    let S = o.newAttributes;
    for (let z = 0, H = S.length; z < H; z++) S[z] = 0;
  }
  function g(S) {
    x(S, 0);
  }
  function x(S, z) {
    let H = o.newAttributes,
      O = o.enabledAttributes,
      q = o.attributeDivisors;
    (H[S] = 1),
      O[S] === 0 && (i.enableVertexAttribArray(S), (O[S] = 1)),
      q[S] !== z && (i.vertexAttribDivisor(S, z), (q[S] = z));
  }
  function y() {
    let S = o.newAttributes,
      z = o.enabledAttributes;
    for (let H = 0, O = z.length; H < O; H++)
      z[H] !== S[H] && (i.disableVertexAttribArray(H), (z[H] = 0));
  }
  function b(S, z, H, O, q, U, T) {
    T === !0 ? i.vertexAttribIPointer(S, z, H, q, U) : i.vertexAttribPointer(S, z, H, O, q, U);
  }
  function m(S, z, H, O) {
    v();
    let q = O.attributes,
      U = H.getAttributes(),
      T = z.defaultAttributeValues;
    for (let D in U) {
      let C = U[D];
      if (C.location >= 0) {
        let G = q[D];
        if (
          (G === void 0 &&
            (D === "instanceMatrix" && S.instanceMatrix && (G = S.instanceMatrix),
            D === "instanceColor" && S.instanceColor && (G = S.instanceColor)),
          G !== void 0)
        ) {
          let j = G.normalized,
            N = G.itemSize,
            Q = e.get(G);
          if (Q === void 0) continue;
          let K = Q.buffer,
            ie = Q.type,
            F = Q.bytesPerElement,
            X = ie === i.INT || ie === i.UNSIGNED_INT || G.gpuType === Lh;
          if (G.isInterleavedBufferAttribute) {
            let ne = G.data,
              re = ne.stride,
              $ = G.offset;
            if (ne.isInstancedInterleavedBuffer) {
              for (let ue = 0; ue < C.locationSize; ue++) x(C.location + ue, ne.meshPerAttribute);
              S.isInstancedMesh !== !0 &&
                O._maxInstanceCount === void 0 &&
                (O._maxInstanceCount = ne.meshPerAttribute * ne.count);
            } else for (let ue = 0; ue < C.locationSize; ue++) g(C.location + ue);
            i.bindBuffer(i.ARRAY_BUFFER, K);
            for (let ue = 0; ue < C.locationSize; ue++)
              b(
                C.location + ue,
                N / C.locationSize,
                ie,
                j,
                re * F,
                ($ + (N / C.locationSize) * ue) * F,
                X,
              );
          } else {
            if (G.isInstancedBufferAttribute) {
              for (let ne = 0; ne < C.locationSize; ne++) x(C.location + ne, G.meshPerAttribute);
              S.isInstancedMesh !== !0 &&
                O._maxInstanceCount === void 0 &&
                (O._maxInstanceCount = G.meshPerAttribute * G.count);
            } else for (let ne = 0; ne < C.locationSize; ne++) g(C.location + ne);
            i.bindBuffer(i.ARRAY_BUFFER, K);
            for (let ne = 0; ne < C.locationSize; ne++)
              b(
                C.location + ne,
                N / C.locationSize,
                ie,
                j,
                N * F,
                (N / C.locationSize) * ne * F,
                X,
              );
          }
        } else if (T !== void 0) {
          let j = T[D];
          if (j !== void 0)
            switch (j.length) {
              case 2:
                i.vertexAttrib2fv(C.location, j);
                break;
              case 3:
                i.vertexAttrib3fv(C.location, j);
                break;
              case 4:
                i.vertexAttrib4fv(C.location, j);
                break;
              default:
                i.vertexAttrib1fv(C.location, j);
            }
        }
      }
    }
    y();
  }
  function A() {
    E();
    for (let S in n) {
      let z = n[S];
      for (let H in z) {
        let O = z[H];
        for (let q in O) u(O[q].object), delete O[q];
        delete z[H];
      }
      delete n[S];
    }
  }
  function _(S) {
    if (n[S.id] === void 0) return;
    let z = n[S.id];
    for (let H in z) {
      let O = z[H];
      for (let q in O) u(O[q].object), delete O[q];
      delete z[H];
    }
    delete n[S.id];
  }
  function M(S) {
    for (let z in n) {
      let H = n[z];
      if (H[S.id] === void 0) continue;
      let O = H[S.id];
      for (let q in O) u(O[q].object), delete O[q];
      delete H[S.id];
    }
  }
  function E() {
    w(), (r = !0), o !== s && ((o = s), c(o.object));
  }
  function w() {
    (s.geometry = null), (s.program = null), (s.wireframe = !1);
  }
  return {
    setup: a,
    reset: E,
    resetDefaultState: w,
    dispose: A,
    releaseStatesOfGeometry: _,
    releaseStatesOfProgram: M,
    initAttributes: v,
    enableAttribute: g,
    disableUnusedAttributes: y,
  };
}
function JS(i, e, t) {
  let n;
  function s(c) {
    n = c;
  }
  function o(c, u) {
    i.drawArrays(n, c, u), t.update(u, n, 1);
  }
  function r(c, u, h) {
    h !== 0 && (i.drawArraysInstanced(n, c, u, h), t.update(u, n, h));
  }
  function a(c, u, h) {
    if (h === 0) return;
    e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n, c, 0, u, 0, h);
    let p = 0;
    for (let d = 0; d < h; d++) p += u[d];
    t.update(p, n, 1);
  }
  function l(c, u, h, f) {
    if (h === 0) return;
    let p = e.get("WEBGL_multi_draw");
    if (p === null) for (let d = 0; d < c.length; d++) r(c[d], u[d], f[d]);
    else {
      p.multiDrawArraysInstancedWEBGL(n, c, 0, u, 0, f, 0, h);
      let d = 0;
      for (let v = 0; v < h; v++) d += u[v] * f[v];
      t.update(d, n, 1);
    }
  }
  (this.setMode = s),
    (this.render = o),
    (this.renderInstances = r),
    (this.renderMultiDraw = a),
    (this.renderMultiDrawInstances = l);
}
function KS(i, e, t, n) {
  let s;
  function o() {
    if (s !== void 0) return s;
    if (e.has("EXT_texture_filter_anisotropic") === !0) {
      let M = e.get("EXT_texture_filter_anisotropic");
      s = i.getParameter(M.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    } else s = 0;
    return s;
  }
  function r(M) {
    return !(M !== _n && n.convert(M) !== i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT));
  }
  function a(M) {
    let E = M === js && (e.has("EXT_color_buffer_half_float") || e.has("EXT_color_buffer_float"));
    return !(
      M !== yi &&
      n.convert(M) !== i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE) &&
      M !== as &&
      !E
    );
  }
  function l(M) {
    if (M === "highp") {
      if (
        i.getShaderPrecisionFormat(i.VERTEX_SHADER, i.HIGH_FLOAT).precision > 0 &&
        i.getShaderPrecisionFormat(i.FRAGMENT_SHADER, i.HIGH_FLOAT).precision > 0
      )
        return "highp";
      M = "mediump";
    }
    return M === "mediump" &&
      i.getShaderPrecisionFormat(i.VERTEX_SHADER, i.MEDIUM_FLOAT).precision > 0 &&
      i.getShaderPrecisionFormat(i.FRAGMENT_SHADER, i.MEDIUM_FLOAT).precision > 0
      ? "mediump"
      : "lowp";
  }
  let c = t.precision !== void 0 ? t.precision : "highp",
    u = l(c);
  u !== c &&
    (console.warn("THREE.WebGLRenderer:", c, "not supported, using", u, "instead."), (c = u));
  let h = t.logarithmicDepthBuffer === !0,
    f = t.reversedDepthBuffer === !0 && e.has("EXT_clip_control"),
    p = i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),
    d = i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
    v = i.getParameter(i.MAX_TEXTURE_SIZE),
    g = i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),
    x = i.getParameter(i.MAX_VERTEX_ATTRIBS),
    y = i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),
    b = i.getParameter(i.MAX_VARYING_VECTORS),
    m = i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),
    A = d > 0,
    _ = i.getParameter(i.MAX_SAMPLES);
  return {
    isWebGL2: !0,
    getMaxAnisotropy: o,
    getMaxPrecision: l,
    textureFormatReadable: r,
    textureTypeReadable: a,
    precision: c,
    logarithmicDepthBuffer: h,
    reversedDepthBuffer: f,
    maxTextures: p,
    maxVertexTextures: d,
    maxTextureSize: v,
    maxCubemapSize: g,
    maxAttributes: x,
    maxVertexUniforms: y,
    maxVaryings: b,
    maxFragmentUniforms: m,
    vertexTextures: A,
    maxSamples: _,
  };
}
function QS(i) {
  let e = this,
    t = null,
    n = 0,
    s = !1,
    o = !1,
    r = new go(),
    a = new kt(),
    l = { value: null, needsUpdate: !1 };
  (this.uniform = l),
    (this.numPlanes = 0),
    (this.numIntersection = 0),
    (this.init = function (h, f) {
      let p = h.length !== 0 || f || n !== 0 || s;
      return (s = f), (n = h.length), p;
    }),
    (this.beginShadows = function () {
      (o = !0), u(null);
    }),
    (this.endShadows = function () {
      o = !1;
    }),
    (this.setGlobalState = function (h, f) {
      t = u(h, f, 0);
    }),
    (this.setState = function (h, f, p) {
      let d = h.clippingPlanes,
        v = h.clipIntersection,
        g = h.clipShadows,
        x = i.get(h);
      if (!s || d === null || d.length === 0 || (o && !g)) o ? u(null) : c();
      else {
        let y = o ? 0 : n,
          b = y * 4,
          m = x.clippingState || null;
        (l.value = m), (m = u(d, f, b, p));
        for (let A = 0; A !== b; ++A) m[A] = t[A];
        (x.clippingState = m),
          (this.numIntersection = v ? this.numPlanes : 0),
          (this.numPlanes += y);
      }
    });
  function c() {
    l.value !== t && ((l.value = t), (l.needsUpdate = n > 0)),
      (e.numPlanes = n),
      (e.numIntersection = 0);
  }
  function u(h, f, p, d) {
    let v = h !== null ? h.length : 0,
      g = null;
    if (v !== 0) {
      if (((g = l.value), d !== !0 || g === null)) {
        let x = p + v * 4,
          y = f.matrixWorldInverse;
        a.getNormalMatrix(y), (g === null || g.length < x) && (g = new Float32Array(x));
        for (let b = 0, m = p; b !== v; ++b, m += 4)
          r.copy(h[b]).applyMatrix4(y, a), r.normal.toArray(g, m), (g[m + 3] = r.constant);
      }
      (l.value = g), (l.needsUpdate = !0);
    }
    return (e.numPlanes = v), (e.numIntersection = 0), g;
  }
}
function eT(i) {
  let e = new WeakMap();
  function t(r, a) {
    return a === yc ? (r.mapping = Cr) : a === bc && (r.mapping = ta), r;
  }
  function n(r) {
    if (r && r.isTexture) {
      let a = r.mapping;
      if (a === yc || a === bc)
        if (e.has(r)) {
          let l = e.get(r).texture;
          return t(l, r.mapping);
        } else {
          let l = r.image;
          if (l && l.height > 0) {
            let c = new D0(l.height);
            return (
              c.fromEquirectangularTexture(i, r),
              e.set(r, c),
              r.addEventListener("dispose", s),
              t(c.texture, r.mapping)
            );
          } else return null;
        }
    }
    return r;
  }
  function s(r) {
    let a = r.target;
    a.removeEventListener("dispose", s);
    let l = e.get(a);
    l !== void 0 && (e.delete(a), l.dispose());
  }
  function o() {
    e = new WeakMap();
  }
  return { get: n, dispose: o };
}
var Cc = 4,
  iy = [0.125, 0.215, 0.35, 0.446, 0.526, 0.582],
  nl = 20,
  _g = new cr(),
  sy = new Ve(),
  Mg = null,
  wg = 0,
  Eg = 0,
  Sg = !1,
  tl = (1 + Math.sqrt(5)) / 2,
  Rc = 1 / tl,
  oy = [
    new W(-tl, Rc, 0),
    new W(tl, Rc, 0),
    new W(-Rc, 0, tl),
    new W(Rc, 0, tl),
    new W(0, tl, -Rc),
    new W(0, tl, Rc),
    new W(-1, 1, -1),
    new W(1, 1, -1),
    new W(-1, 1, 1),
    new W(1, 1, 1),
  ],
  tT = new W(),
  ia = class {
    constructor(e) {
      (this._renderer = e),
        (this._pingPongRenderTarget = null),
        (this._lodMax = 0),
        (this._cubeSize = 0),
        (this._lodPlanes = []),
        (this._sizeLods = []),
        (this._sigmas = []),
        (this._blurMaterial = null),
        (this._cubemapMaterial = null),
        (this._equirectMaterial = null),
        this._compileMaterial(this._blurMaterial);
    }
    fromScene(e, t = 0, n = 0.1, s = 100, o = {}) {
      let { size: r = 256, position: a = tT } = o;
      (Mg = this._renderer.getRenderTarget()),
        (wg = this._renderer.getActiveCubeFace()),
        (Eg = this._renderer.getActiveMipmapLevel()),
        (Sg = this._renderer.xr.enabled),
        (this._renderer.xr.enabled = !1),
        this._setSize(r);
      let l = this._allocateTargets();
      return (
        (l.depthBuffer = !0),
        this._sceneToCubeUV(e, n, s, l, a),
        t > 0 && this._blur(l, 0, 0, t),
        this._applyPMREM(l),
        this._cleanup(l),
        l
      );
    }
    fromEquirectangular(e, t = null) {
      return this._fromTexture(e, t);
    }
    fromCubemap(e, t = null) {
      return this._fromTexture(e, t);
    }
    compileCubemapShader() {
      this._cubemapMaterial === null &&
        ((this._cubemapMaterial = ly()), this._compileMaterial(this._cubemapMaterial));
    }
    compileEquirectangularShader() {
      this._equirectMaterial === null &&
        ((this._equirectMaterial = ay()), this._compileMaterial(this._equirectMaterial));
    }
    dispose() {
      this._dispose(),
        this._cubemapMaterial !== null && this._cubemapMaterial.dispose(),
        this._equirectMaterial !== null && this._equirectMaterial.dispose();
    }
    _setSize(e) {
      (this._lodMax = Math.floor(Math.log2(e))), (this._cubeSize = Math.pow(2, this._lodMax));
    }
    _dispose() {
      this._blurMaterial !== null && this._blurMaterial.dispose(),
        this._pingPongRenderTarget !== null && this._pingPongRenderTarget.dispose();
      for (let e = 0; e < this._lodPlanes.length; e++) this._lodPlanes[e].dispose();
    }
    _cleanup(e) {
      this._renderer.setRenderTarget(Mg, wg, Eg),
        (this._renderer.xr.enabled = Sg),
        (e.scissorTest = !1),
        Qp(e, 0, 0, e.width, e.height);
    }
    _fromTexture(e, t) {
      e.mapping === Cr || e.mapping === ta
        ? this._setSize(e.image.length === 0 ? 16 : e.image[0].width || e.image[0].image.width)
        : this._setSize(e.image.width / 4),
        (Mg = this._renderer.getRenderTarget()),
        (wg = this._renderer.getActiveCubeFace()),
        (Eg = this._renderer.getActiveMipmapLevel()),
        (Sg = this._renderer.xr.enabled),
        (this._renderer.xr.enabled = !1);
      let n = t || this._allocateTargets();
      return this._textureToCubeUV(e, n), this._applyPMREM(n), this._cleanup(n), n;
    }
    _allocateTargets() {
      let e = 3 * Math.max(this._cubeSize, 112),
        t = 4 * this._cubeSize,
        n = {
          magFilter: Zt,
          minFilter: Zt,
          generateMipmaps: !1,
          type: js,
          format: _n,
          colorSpace: Er,
          depthBuffer: !1,
        },
        s = ry(e, t, n);
      if (
        this._pingPongRenderTarget === null ||
        this._pingPongRenderTarget.width !== e ||
        this._pingPongRenderTarget.height !== t
      ) {
        this._pingPongRenderTarget !== null && this._dispose(),
          (this._pingPongRenderTarget = ry(e, t, n));
        let { _lodMax: o } = this;
        ({ sizeLods: this._sizeLods, lodPlanes: this._lodPlanes, sigmas: this._sigmas } = nT(o)),
          (this._blurMaterial = iT(o, e, t));
      }
      return s;
    }
    _compileMaterial(e) {
      let t = new Qe(this._lodPlanes[0], e);
      this._renderer.compile(t, _g);
    }
    _sceneToCubeUV(e, t, n, s, o) {
      let l = new Wn(90, 1, t, n),
        c = [1, -1, 1, 1, 1, 1],
        u = [1, 1, 1, -1, -1, -1],
        h = this._renderer,
        f = h.autoClear,
        p = h.toneMapping;
      h.getClearColor(sy),
        (h.toneMapping = ys),
        (h.autoClear = !1),
        h.state.buffers.depth.getReversed() &&
          (h.setRenderTarget(s), h.clearDepth(), h.setRenderTarget(null));
      let v = new Nn({ name: "PMREM.Background", side: Ki, depthWrite: !1, depthTest: !1 }),
        g = new Qe(new un(), v),
        x = !1,
        y = e.background;
      y
        ? y.isColor && (v.color.copy(y), (e.background = null), (x = !0))
        : (v.color.copy(sy), (x = !0));
      for (let b = 0; b < 6; b++) {
        let m = b % 3;
        m === 0
          ? (l.up.set(0, c[b], 0), l.position.set(o.x, o.y, o.z), l.lookAt(o.x + u[b], o.y, o.z))
          : m === 1
            ? (l.up.set(0, 0, c[b]),
              l.position.set(o.x, o.y, o.z),
              l.lookAt(o.x, o.y + u[b], o.z))
            : (l.up.set(0, c[b], 0),
              l.position.set(o.x, o.y, o.z),
              l.lookAt(o.x, o.y, o.z + u[b]));
        let A = this._cubeSize;
        Qp(s, m * A, b > 2 ? A : 0, A, A),
          h.setRenderTarget(s),
          x && h.render(g, l),
          h.render(e, l);
      }
      g.geometry.dispose(),
        g.material.dispose(),
        (h.toneMapping = p),
        (h.autoClear = f),
        (e.background = y);
    }
    _textureToCubeUV(e, t) {
      let n = this._renderer,
        s = e.mapping === Cr || e.mapping === ta;
      s
        ? (this._cubemapMaterial === null && (this._cubemapMaterial = ly()),
          (this._cubemapMaterial.uniforms.flipEnvMap.value =
            e.isRenderTargetTexture === !1 ? -1 : 1))
        : this._equirectMaterial === null && (this._equirectMaterial = ay());
      let o = s ? this._cubemapMaterial : this._equirectMaterial,
        r = new Qe(this._lodPlanes[0], o),
        a = o.uniforms;
      a.envMap.value = e;
      let l = this._cubeSize;
      Qp(t, 0, 0, 3 * l, 2 * l), n.setRenderTarget(t), n.render(r, _g);
    }
    _applyPMREM(e) {
      let t = this._renderer,
        n = t.autoClear;
      t.autoClear = !1;
      let s = this._lodPlanes.length;
      for (let o = 1; o < s; o++) {
        let r = Math.sqrt(
            this._sigmas[o] * this._sigmas[o] - this._sigmas[o - 1] * this._sigmas[o - 1],
          ),
          a = oy[(s - o - 1) % oy.length];
        this._blur(e, o - 1, o, r, a);
      }
      t.autoClear = n;
    }
    _blur(e, t, n, s, o) {
      let r = this._pingPongRenderTarget;
      this._halfBlur(e, r, t, n, s, "latitudinal", o),
        this._halfBlur(r, e, n, n, s, "longitudinal", o);
    }
    _halfBlur(e, t, n, s, o, r, a) {
      let l = this._renderer,
        c = this._blurMaterial;
      r !== "latitudinal" &&
        r !== "longitudinal" &&
        console.error("blur direction must be either latitudinal or longitudinal!");
      let u = 3,
        h = new Qe(this._lodPlanes[s], c),
        f = c.uniforms,
        p = this._sizeLods[n] - 1,
        d = isFinite(o) ? Math.PI / (2 * p) : (2 * Math.PI) / (2 * nl - 1),
        v = o / d,
        g = isFinite(o) ? 1 + Math.floor(u * v) : nl;
      g > nl &&
        console.warn(
          `sigmaRadians, ${o}, is too large and will clip, as it requested ${g} samples when the maximum is set to ${nl}`,
        );
      let x = [],
        y = 0;
      for (let M = 0; M < nl; ++M) {
        let E = M / v,
          w = Math.exp((-E * E) / 2);
        x.push(w), M === 0 ? (y += w) : M < g && (y += 2 * w);
      }
      for (let M = 0; M < x.length; M++) x[M] = x[M] / y;
      (f.envMap.value = e.texture),
        (f.samples.value = g),
        (f.weights.value = x),
        (f.latitudinal.value = r === "latitudinal"),
        a && (f.poleAxis.value = a);
      let { _lodMax: b } = this;
      (f.dTheta.value = d), (f.mipInt.value = b - n);
      let m = this._sizeLods[s],
        A = 3 * m * (s > b - Cc ? s - b + Cc : 0),
        _ = 4 * (this._cubeSize - m);
      Qp(t, A, _, 3 * m, 2 * m), l.setRenderTarget(t), l.render(h, _g);
    }
  };
function nT(i) {
  let e = [],
    t = [],
    n = [],
    s = i,
    o = i - Cc + 1 + iy.length;
  for (let r = 0; r < o; r++) {
    let a = Math.pow(2, s);
    t.push(a);
    let l = 1 / a;
    r > i - Cc ? (l = iy[r - i + Cc - 1]) : r === 0 && (l = 0), n.push(l);
    let c = 1 / (a - 2),
      u = -c,
      h = 1 + c,
      f = [u, u, h, u, h, h, u, u, h, h, u, h],
      p = 6,
      d = 6,
      v = 3,
      g = 2,
      x = 1,
      y = new Float32Array(v * d * p),
      b = new Float32Array(g * d * p),
      m = new Float32Array(x * d * p);
    for (let _ = 0; _ < p; _++) {
      let M = ((_ % 3) * 2) / 3 - 1,
        E = _ > 2 ? 0 : -1,
        w = [
          M,
          E,
          0,
          M + 2 / 3,
          E,
          0,
          M + 2 / 3,
          E + 1,
          0,
          M,
          E,
          0,
          M + 2 / 3,
          E + 1,
          0,
          M,
          E + 1,
          0,
        ];
      y.set(w, v * d * _), b.set(f, g * d * _);
      let S = [_, _, _, _, _, _];
      m.set(S, x * d * _);
    }
    let A = new nt();
    A.setAttribute("position", new et(y, v)),
      A.setAttribute("uv", new et(b, g)),
      A.setAttribute("faceIndex", new et(m, x)),
      e.push(A),
      s > Cc && s--;
  }
  return { lodPlanes: e, sizeLods: t, sigmas: n };
}
function ry(i, e, t) {
  let n = new si(i, e, t);
  return (n.texture.mapping = X0), (n.texture.name = "PMREM.cubeUv"), (n.scissorTest = !0), n;
}
function Qp(i, e, t, n, s) {
  i.viewport.set(e, t, n, s), i.scissor.set(e, t, n, s);
}
function iT(i, e, t) {
  let n = new Float32Array(nl),
    s = new W(0, 1, 0);
  return new zn({
    name: "SphericalGaussianBlur",
    defines: {
      n: nl,
      CUBEUV_TEXEL_WIDTH: 1 / e,
      CUBEUV_TEXEL_HEIGHT: 1 / t,
      CUBEUV_MAX_MIP: `${i}.0`,
    },
    uniforms: {
      envMap: { value: null },
      samples: { value: 1 },
      weights: { value: n },
      latitudinal: { value: !1 },
      dTheta: { value: 0 },
      mipInt: { value: 0 },
      poleAxis: { value: s },
    },
    vertexShader: kg(),
    fragmentShader: `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,
    blending: ko,
    depthTest: !1,
    depthWrite: !1,
  });
}
function ay() {
  return new zn({
    name: "EquirectangularToCubeUV",
    uniforms: { envMap: { value: null } },
    vertexShader: kg(),
    fragmentShader: `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,
    blending: ko,
    depthTest: !1,
    depthWrite: !1,
  });
}
function ly() {
  return new zn({
    name: "CubemapToCubeUV",
    uniforms: { envMap: { value: null }, flipEnvMap: { value: -1 } },
    vertexShader: kg(),
    fragmentShader: `

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,
    blending: ko,
    depthTest: !1,
    depthWrite: !1,
  });
}
function kg() {
  return `

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`;
}
function sT(i) {
  let e = new WeakMap(),
    t = null;
  function n(a) {
    if (a && a.isTexture) {
      let l = a.mapping,
        c = l === yc || l === bc,
        u = l === Cr || l === ta;
      if (c || u) {
        let h = e.get(a),
          f = h !== void 0 ? h.texture.pmremVersion : 0;
        if (a.isRenderTargetTexture && a.pmremVersion !== f)
          return (
            t === null && (t = new ia(i)),
            (h = c ? t.fromEquirectangular(a, h) : t.fromCubemap(a, h)),
            (h.texture.pmremVersion = a.pmremVersion),
            e.set(a, h),
            h.texture
          );
        if (h !== void 0) return h.texture;
        {
          let p = a.image;
          return (c && p && p.height > 0) || (u && p && s(p))
            ? (t === null && (t = new ia(i)),
              (h = c ? t.fromEquirectangular(a) : t.fromCubemap(a)),
              (h.texture.pmremVersion = a.pmremVersion),
              e.set(a, h),
              a.addEventListener("dispose", o),
              h.texture)
            : null;
        }
      }
    }
    return a;
  }
  function s(a) {
    let l = 0,
      c = 6;
    for (let u = 0; u < c; u++) a[u] !== void 0 && l++;
    return l === c;
  }
  function o(a) {
    let l = a.target;
    l.removeEventListener("dispose", o);
    let c = e.get(l);
    c !== void 0 && (e.delete(l), c.dispose());
  }
  function r() {
    (e = new WeakMap()), t !== null && (t.dispose(), (t = null));
  }
  return { get: n, dispose: r };
}
function oT(i) {
  let e = {};
  function t(n) {
    if (e[n] !== void 0) return e[n];
    let s;
    switch (n) {
      case "WEBGL_depth_texture":
        s =
          i.getExtension("WEBGL_depth_texture") ||
          i.getExtension("MOZ_WEBGL_depth_texture") ||
          i.getExtension("WEBKIT_WEBGL_depth_texture");
        break;
      case "EXT_texture_filter_anisotropic":
        s =
          i.getExtension("EXT_texture_filter_anisotropic") ||
          i.getExtension("MOZ_EXT_texture_filter_anisotropic") ||
          i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
        break;
      case "WEBGL_compressed_texture_s3tc":
        s =
          i.getExtension("WEBGL_compressed_texture_s3tc") ||
          i.getExtension("MOZ_WEBGL_compressed_texture_s3tc") ||
          i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
        break;
      case "WEBGL_compressed_texture_pvrtc":
        s =
          i.getExtension("WEBGL_compressed_texture_pvrtc") ||
          i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");
        break;
      default:
        s = i.getExtension(n);
    }
    return (e[n] = s), s;
  }
  return {
    has: function (n) {
      return t(n) !== null;
    },
    init: function () {
      t("EXT_color_buffer_float"),
        t("WEBGL_clip_cull_distance"),
        t("OES_texture_float_linear"),
        t("EXT_color_buffer_half_float"),
        t("WEBGL_multisampled_render_to_texture"),
        t("WEBGL_render_shared_exponent");
    },
    get: function (n) {
      let s = t(n);
      return s === null && jl("THREE.WebGLRenderer: " + n + " extension not supported."), s;
    },
  };
}
function rT(i, e, t, n) {
  let s = {},
    o = new WeakMap();
  function r(h) {
    let f = h.target;
    f.index !== null && e.remove(f.index);
    for (let d in f.attributes) e.remove(f.attributes[d]);
    f.removeEventListener("dispose", r), delete s[f.id];
    let p = o.get(f);
    p && (e.remove(p), o.delete(f)),
      n.releaseStatesOfGeometry(f),
      f.isInstancedBufferGeometry === !0 && delete f._maxInstanceCount,
      t.memory.geometries--;
  }
  function a(h, f) {
    return (
      s[f.id] === !0 || (f.addEventListener("dispose", r), (s[f.id] = !0), t.memory.geometries++),
      f
    );
  }
  function l(h) {
    let f = h.attributes;
    for (let p in f) e.update(f[p], i.ARRAY_BUFFER);
  }
  function c(h) {
    let f = [],
      p = h.index,
      d = h.attributes.position,
      v = 0;
    if (p !== null) {
      let y = p.array;
      v = p.version;
      for (let b = 0, m = y.length; b < m; b += 3) {
        let A = y[b + 0],
          _ = y[b + 1],
          M = y[b + 2];
        f.push(A, _, _, M, M, A);
      }
    } else if (d !== void 0) {
      let y = d.array;
      v = d.version;
      for (let b = 0, m = y.length / 3 - 1; b < m; b += 3) {
        let A = b + 0,
          _ = b + 1,
          M = b + 2;
        f.push(A, _, _, M, M, A);
      }
    } else return;
    let g = new (fg(f) ? Ql : Kl)(f, 1);
    g.version = v;
    let x = o.get(h);
    x && e.remove(x), o.set(h, g);
  }
  function u(h) {
    let f = o.get(h);
    if (f) {
      let p = h.index;
      p !== null && f.version < p.version && c(h);
    } else c(h);
    return o.get(h);
  }
  return { get: a, update: l, getWireframeAttribute: u };
}
function aT(i, e, t) {
  let n;
  function s(f) {
    n = f;
  }
  let o, r;
  function a(f) {
    (o = f.type), (r = f.bytesPerElement);
  }
  function l(f, p) {
    i.drawElements(n, p, o, f * r), t.update(p, n, 1);
  }
  function c(f, p, d) {
    d !== 0 && (i.drawElementsInstanced(n, p, o, f * r, d), t.update(p, n, d));
  }
  function u(f, p, d) {
    if (d === 0) return;
    e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n, p, 0, o, f, 0, d);
    let g = 0;
    for (let x = 0; x < d; x++) g += p[x];
    t.update(g, n, 1);
  }
  function h(f, p, d, v) {
    if (d === 0) return;
    let g = e.get("WEBGL_multi_draw");
    if (g === null) for (let x = 0; x < f.length; x++) c(f[x] / r, p[x], v[x]);
    else {
      g.multiDrawElementsInstancedWEBGL(n, p, 0, o, f, 0, v, 0, d);
      let x = 0;
      for (let y = 0; y < d; y++) x += p[y] * v[y];
      t.update(x, n, 1);
    }
  }
  (this.setMode = s),
    (this.setIndex = a),
    (this.render = l),
    (this.renderInstances = c),
    (this.renderMultiDraw = u),
    (this.renderMultiDrawInstances = h);
}
function lT(i) {
  let e = { geometries: 0, textures: 0 },
    t = { frame: 0, calls: 0, triangles: 0, points: 0, lines: 0 };
  function n(o, r, a) {
    switch ((t.calls++, r)) {
      case i.TRIANGLES:
        t.triangles += a * (o / 3);
        break;
      case i.LINES:
        t.lines += a * (o / 2);
        break;
      case i.LINE_STRIP:
        t.lines += a * (o - 1);
        break;
      case i.LINE_LOOP:
        t.lines += a * o;
        break;
      case i.POINTS:
        t.points += a * o;
        break;
      default:
        console.error("THREE.WebGLInfo: Unknown draw mode:", r);
        break;
    }
  }
  function s() {
    (t.calls = 0), (t.triangles = 0), (t.points = 0), (t.lines = 0);
  }
  return { memory: e, render: t, programs: null, autoReset: !0, reset: s, update: n };
}
function cT(i, e, t) {
  let n = new WeakMap(),
    s = new Dt();
  function o(r, a, l) {
    let c = r.morphTargetInfluences,
      u = a.morphAttributes.position || a.morphAttributes.normal || a.morphAttributes.color,
      h = u !== void 0 ? u.length : 0,
      f = n.get(a);
    if (f === void 0 || f.count !== h) {
      let w = function () {
        M.dispose(), n.delete(a), a.removeEventListener("dispose", w);
      };
      f !== void 0 && f.texture.dispose();
      let p = a.morphAttributes.position !== void 0,
        d = a.morphAttributes.normal !== void 0,
        v = a.morphAttributes.color !== void 0,
        g = a.morphAttributes.position || [],
        x = a.morphAttributes.normal || [],
        y = a.morphAttributes.color || [],
        b = 0;
      p === !0 && (b = 1), d === !0 && (b = 2), v === !0 && (b = 3);
      let m = a.attributes.position.count * b,
        A = 1;
      m > e.maxTextureSize && ((A = Math.ceil(m / e.maxTextureSize)), (m = e.maxTextureSize));
      let _ = new Float32Array(m * A * 4 * h),
        M = new A0(_, m, A, h);
      (M.type = as), (M.needsUpdate = !0);
      let E = b * 4;
      for (let S = 0; S < h; S++) {
        let z = g[S],
          H = x[S],
          O = y[S],
          q = m * A * 4 * S;
        for (let U = 0; U < z.count; U++) {
          let T = U * E;
          p === !0 &&
            (s.fromBufferAttribute(z, U),
            (_[q + T + 0] = s.x),
            (_[q + T + 1] = s.y),
            (_[q + T + 2] = s.z),
            (_[q + T + 3] = 0)),
            d === !0 &&
              (s.fromBufferAttribute(H, U),
              (_[q + T + 4] = s.x),
              (_[q + T + 5] = s.y),
              (_[q + T + 6] = s.z),
              (_[q + T + 7] = 0)),
            v === !0 &&
              (s.fromBufferAttribute(O, U),
              (_[q + T + 8] = s.x),
              (_[q + T + 9] = s.y),
              (_[q + T + 10] = s.z),
              (_[q + T + 11] = O.itemSize === 4 ? s.w : 1));
        }
      }
      (f = { count: h, texture: M, size: new Ae(m, A) }),
        n.set(a, f),
        a.addEventListener("dispose", w);
    }
    if (r.isInstancedMesh === !0 && r.morphTexture !== null)
      l.getUniforms().setValue(i, "morphTexture", r.morphTexture, t);
    else {
      let p = 0;
      for (let v = 0; v < c.length; v++) p += c[v];
      let d = a.morphTargetsRelative ? 1 : 1 - p;
      l.getUniforms().setValue(i, "morphTargetBaseInfluence", d),
        l.getUniforms().setValue(i, "morphTargetInfluences", c);
    }
    l.getUniforms().setValue(i, "morphTargetsTexture", f.texture, t),
      l.getUniforms().setValue(i, "morphTargetsTextureSize", f.size);
  }
  return { update: o };
}
function uT(i, e, t, n) {
  let s = new WeakMap();
  function o(l) {
    let c = n.render.frame,
      u = l.geometry,
      h = e.get(l, u);
    if (
      (s.get(h) !== c && (e.update(h), s.set(h, c)),
      l.isInstancedMesh &&
        (l.hasEventListener("dispose", a) === !1 && l.addEventListener("dispose", a),
        s.get(l) !== c &&
          (t.update(l.instanceMatrix, i.ARRAY_BUFFER),
          l.instanceColor !== null && t.update(l.instanceColor, i.ARRAY_BUFFER),
          s.set(l, c))),
      l.isSkinnedMesh)
    ) {
      let f = l.skeleton;
      s.get(f) !== c && (f.update(), s.set(f, c));
    }
    return h;
  }
  function r() {
    s = new WeakMap();
  }
  function a(l) {
    let c = l.target;
    c.removeEventListener("dispose", a),
      t.remove(c.instanceMatrix),
      c.instanceColor !== null && t.remove(c.instanceColor);
  }
  return { update: o, dispose: r };
}
var Ay = new xi(),
  cy = new Tr(1, 1),
  Ry = new A0(),
  Cy = new R0(),
  Py = new Da(),
  uy = [],
  hy = [],
  fy = new Float32Array(16),
  dy = new Float32Array(9),
  py = new Float32Array(4);
function Ic(i, e, t) {
  let n = i[0];
  if (n <= 0 || n > 0) return i;
  let s = e * t,
    o = uy[s];
  if ((o === void 0 && ((o = new Float32Array(s)), (uy[s] = o)), e !== 0)) {
    n.toArray(o, 0);
    for (let r = 1, a = 0; r !== e; ++r) (a += t), i[r].toArray(o, a);
  }
  return o;
}
function Hi(i, e) {
  if (i.length !== e.length) return !1;
  for (let t = 0, n = i.length; t < n; t++) if (i[t] !== e[t]) return !1;
  return !0;
}
function Vi(i, e) {
  for (let t = 0, n = e.length; t < n; t++) i[t] = e[t];
}
function t1(i, e) {
  let t = hy[e];
  t === void 0 && ((t = new Int32Array(e)), (hy[e] = t));
  for (let n = 0; n !== e; ++n) t[n] = i.allocateTextureUnit();
  return t;
}
function hT(i, e) {
  let t = this.cache;
  t[0] !== e && (i.uniform1f(this.addr, e), (t[0] = e));
}
function fT(i, e) {
  let t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y) &&
      (i.uniform2f(this.addr, e.x, e.y), (t[0] = e.x), (t[1] = e.y));
  else {
    if (Hi(t, e)) return;
    i.uniform2fv(this.addr, e), Vi(t, e);
  }
}
function dT(i, e) {
  let t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) &&
      (i.uniform3f(this.addr, e.x, e.y, e.z), (t[0] = e.x), (t[1] = e.y), (t[2] = e.z));
  else if (e.r !== void 0)
    (t[0] !== e.r || t[1] !== e.g || t[2] !== e.b) &&
      (i.uniform3f(this.addr, e.r, e.g, e.b), (t[0] = e.r), (t[1] = e.g), (t[2] = e.b));
  else {
    if (Hi(t, e)) return;
    i.uniform3fv(this.addr, e), Vi(t, e);
  }
}
function pT(i, e) {
  let t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) &&
      (i.uniform4f(this.addr, e.x, e.y, e.z, e.w),
      (t[0] = e.x),
      (t[1] = e.y),
      (t[2] = e.z),
      (t[3] = e.w));
  else {
    if (Hi(t, e)) return;
    i.uniform4fv(this.addr, e), Vi(t, e);
  }
}
function mT(i, e) {
  let t = this.cache,
    n = e.elements;
  if (n === void 0) {
    if (Hi(t, e)) return;
    i.uniformMatrix2fv(this.addr, !1, e), Vi(t, e);
  } else {
    if (Hi(t, n)) return;
    py.set(n), i.uniformMatrix2fv(this.addr, !1, py), Vi(t, n);
  }
}
function gT(i, e) {
  let t = this.cache,
    n = e.elements;
  if (n === void 0) {
    if (Hi(t, e)) return;
    i.uniformMatrix3fv(this.addr, !1, e), Vi(t, e);
  } else {
    if (Hi(t, n)) return;
    dy.set(n), i.uniformMatrix3fv(this.addr, !1, dy), Vi(t, n);
  }
}
function vT(i, e) {
  let t = this.cache,
    n = e.elements;
  if (n === void 0) {
    if (Hi(t, e)) return;
    i.uniformMatrix4fv(this.addr, !1, e), Vi(t, e);
  } else {
    if (Hi(t, n)) return;
    fy.set(n), i.uniformMatrix4fv(this.addr, !1, fy), Vi(t, n);
  }
}
function xT(i, e) {
  let t = this.cache;
  t[0] !== e && (i.uniform1i(this.addr, e), (t[0] = e));
}
function yT(i, e) {
  let t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y) &&
      (i.uniform2i(this.addr, e.x, e.y), (t[0] = e.x), (t[1] = e.y));
  else {
    if (Hi(t, e)) return;
    i.uniform2iv(this.addr, e), Vi(t, e);
  }
}
function bT(i, e) {
  let t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) &&
      (i.uniform3i(this.addr, e.x, e.y, e.z), (t[0] = e.x), (t[1] = e.y), (t[2] = e.z));
  else {
    if (Hi(t, e)) return;
    i.uniform3iv(this.addr, e), Vi(t, e);
  }
}
function _T(i, e) {
  let t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) &&
      (i.uniform4i(this.addr, e.x, e.y, e.z, e.w),
      (t[0] = e.x),
      (t[1] = e.y),
      (t[2] = e.z),
      (t[3] = e.w));
  else {
    if (Hi(t, e)) return;
    i.uniform4iv(this.addr, e), Vi(t, e);
  }
}
function MT(i, e) {
  let t = this.cache;
  t[0] !== e && (i.uniform1ui(this.addr, e), (t[0] = e));
}
function wT(i, e) {
  let t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y) &&
      (i.uniform2ui(this.addr, e.x, e.y), (t[0] = e.x), (t[1] = e.y));
  else {
    if (Hi(t, e)) return;
    i.uniform2uiv(this.addr, e), Vi(t, e);
  }
}
function ET(i, e) {
  let t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) &&
      (i.uniform3ui(this.addr, e.x, e.y, e.z), (t[0] = e.x), (t[1] = e.y), (t[2] = e.z));
  else {
    if (Hi(t, e)) return;
    i.uniform3uiv(this.addr, e), Vi(t, e);
  }
}
function ST(i, e) {
  let t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) &&
      (i.uniform4ui(this.addr, e.x, e.y, e.z, e.w),
      (t[0] = e.x),
      (t[1] = e.y),
      (t[2] = e.z),
      (t[3] = e.w));
  else {
    if (Hi(t, e)) return;
    i.uniform4uiv(this.addr, e), Vi(t, e);
  }
}
function TT(i, e, t) {
  let n = this.cache,
    s = t.allocateTextureUnit();
  n[0] !== s && (i.uniform1i(this.addr, s), (n[0] = s));
  let o;
  this.type === i.SAMPLER_2D_SHADOW ? ((cy.compareFunction = jp), (o = cy)) : (o = Ay),
    t.setTexture2D(e || o, s);
}
function AT(i, e, t) {
  let n = this.cache,
    s = t.allocateTextureUnit();
  n[0] !== s && (i.uniform1i(this.addr, s), (n[0] = s)), t.setTexture3D(e || Cy, s);
}
function RT(i, e, t) {
  let n = this.cache,
    s = t.allocateTextureUnit();
  n[0] !== s && (i.uniform1i(this.addr, s), (n[0] = s)), t.setTextureCube(e || Py, s);
}
function CT(i, e, t) {
  let n = this.cache,
    s = t.allocateTextureUnit();
  n[0] !== s && (i.uniform1i(this.addr, s), (n[0] = s)), t.setTexture2DArray(e || Ry, s);
}
function PT(i) {
  switch (i) {
    case 5126:
      return hT;
    case 35664:
      return fT;
    case 35665:
      return dT;
    case 35666:
      return pT;
    case 35674:
      return mT;
    case 35675:
      return gT;
    case 35676:
      return vT;
    case 5124:
    case 35670:
      return xT;
    case 35667:
    case 35671:
      return yT;
    case 35668:
    case 35672:
      return bT;
    case 35669:
    case 35673:
      return _T;
    case 5125:
      return MT;
    case 36294:
      return wT;
    case 36295:
      return ET;
    case 36296:
      return ST;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return TT;
    case 35679:
    case 36299:
    case 36307:
      return AT;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return RT;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return CT;
  }
}
function IT(i, e) {
  i.uniform1fv(this.addr, e);
}
function zT(i, e) {
  let t = Ic(e, this.size, 2);
  i.uniform2fv(this.addr, t);
}
function DT(i, e) {
  let t = Ic(e, this.size, 3);
  i.uniform3fv(this.addr, t);
}
function LT(i, e) {
  let t = Ic(e, this.size, 4);
  i.uniform4fv(this.addr, t);
}
function kT(i, e) {
  let t = Ic(e, this.size, 4);
  i.uniformMatrix2fv(this.addr, !1, t);
}
function FT(i, e) {
  let t = Ic(e, this.size, 9);
  i.uniformMatrix3fv(this.addr, !1, t);
}
function UT(i, e) {
  let t = Ic(e, this.size, 16);
  i.uniformMatrix4fv(this.addr, !1, t);
}
function NT(i, e) {
  i.uniform1iv(this.addr, e);
}
function BT(i, e) {
  i.uniform2iv(this.addr, e);
}
function OT(i, e) {
  i.uniform3iv(this.addr, e);
}
function HT(i, e) {
  i.uniform4iv(this.addr, e);
}
function VT(i, e) {
  i.uniform1uiv(this.addr, e);
}
function WT(i, e) {
  i.uniform2uiv(this.addr, e);
}
function GT(i, e) {
  i.uniform3uiv(this.addr, e);
}
function qT(i, e) {
  i.uniform4uiv(this.addr, e);
}
function XT(i, e, t) {
  let n = this.cache,
    s = e.length,
    o = t1(t, s);
  Hi(n, o) || (i.uniform1iv(this.addr, o), Vi(n, o));
  for (let r = 0; r !== s; ++r) t.setTexture2D(e[r] || Ay, o[r]);
}
function YT(i, e, t) {
  let n = this.cache,
    s = e.length,
    o = t1(t, s);
  Hi(n, o) || (i.uniform1iv(this.addr, o), Vi(n, o));
  for (let r = 0; r !== s; ++r) t.setTexture3D(e[r] || Cy, o[r]);
}
function $T(i, e, t) {
  let n = this.cache,
    s = e.length,
    o = t1(t, s);
  Hi(n, o) || (i.uniform1iv(this.addr, o), Vi(n, o));
  for (let r = 0; r !== s; ++r) t.setTextureCube(e[r] || Py, o[r]);
}
function ZT(i, e, t) {
  let n = this.cache,
    s = e.length,
    o = t1(t, s);
  Hi(n, o) || (i.uniform1iv(this.addr, o), Vi(n, o));
  for (let r = 0; r !== s; ++r) t.setTexture2DArray(e[r] || Ry, o[r]);
}
function jT(i) {
  switch (i) {
    case 5126:
      return IT;
    case 35664:
      return zT;
    case 35665:
      return DT;
    case 35666:
      return LT;
    case 35674:
      return kT;
    case 35675:
      return FT;
    case 35676:
      return UT;
    case 5124:
    case 35670:
      return NT;
    case 35667:
    case 35671:
      return BT;
    case 35668:
    case 35672:
      return OT;
    case 35669:
    case 35673:
      return HT;
    case 5125:
      return VT;
    case 36294:
      return WT;
    case 36295:
      return GT;
    case 36296:
      return qT;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return XT;
    case 35679:
    case 36299:
    case 36307:
      return YT;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return $T;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return ZT;
  }
}
var Ag = class {
    constructor(e, t, n) {
      (this.id = e),
        (this.addr = n),
        (this.cache = []),
        (this.type = t.type),
        (this.setValue = PT(t.type));
    }
  },
  Rg = class {
    constructor(e, t, n) {
      (this.id = e),
        (this.addr = n),
        (this.cache = []),
        (this.type = t.type),
        (this.size = t.size),
        (this.setValue = jT(t.type));
    }
  },
  Cg = class {
    constructor(e) {
      (this.id = e), (this.seq = []), (this.map = {});
    }
    setValue(e, t, n) {
      let s = this.seq;
      for (let o = 0, r = s.length; o !== r; ++o) {
        let a = s[o];
        a.setValue(e, t[a.id], n);
      }
    }
  },
  Tg = /(\w+)(\])?(\[|\.)?/g;
function my(i, e) {
  i.seq.push(e), (i.map[e.id] = e);
}
function JT(i, e, t) {
  let n = i.name,
    s = n.length;
  for (Tg.lastIndex = 0; ; ) {
    let o = Tg.exec(n),
      r = Tg.lastIndex,
      a = o[1],
      l = o[2] === "]",
      c = o[3];
    if ((l && (a = a | 0), c === void 0 || (c === "[" && r + 2 === s))) {
      my(t, c === void 0 ? new Ag(a, i, e) : new Rg(a, i, e));
      break;
    } else {
      let h = t.map[a];
      h === void 0 && ((h = new Cg(a)), my(t, h)), (t = h);
    }
  }
}
var Pc = class {
  constructor(e, t) {
    (this.seq = []), (this.map = {});
    let n = e.getProgramParameter(t, e.ACTIVE_UNIFORMS);
    for (let s = 0; s < n; ++s) {
      let o = e.getActiveUniform(t, s),
        r = e.getUniformLocation(t, o.name);
      JT(o, r, this);
    }
  }
  setValue(e, t, n, s) {
    let o = this.map[t];
    o !== void 0 && o.setValue(e, n, s);
  }
  setOptional(e, t, n) {
    let s = t[n];
    s !== void 0 && this.setValue(e, n, s);
  }
  static upload(e, t, n, s) {
    for (let o = 0, r = t.length; o !== r; ++o) {
      let a = t[o],
        l = n[a.id];
      l.needsUpdate !== !1 && a.setValue(e, l.value, s);
    }
  }
  static seqWithValue(e, t) {
    let n = [];
    for (let s = 0, o = e.length; s !== o; ++s) {
      let r = e[s];
      r.id in t && n.push(r);
    }
    return n;
  }
};
function gy(i, e, t) {
  let n = i.createShader(e);
  return i.shaderSource(n, t), i.compileShader(n), n;
}
var KT = 37297,
  QT = 0;
function e6(i, e) {
  let t = i.split(`
`),
    n = [],
    s = Math.max(e - 6, 0),
    o = Math.min(e + 6, t.length);
  for (let r = s; r < o; r++) {
    let a = r + 1;
    n.push(`${a === e ? ">" : " "} ${a}: ${t[r]}`);
  }
  return n.join(`
`);
}
var vy = new kt();
function t6(i) {
  Kt._getMatrix(vy, Kt.workingColorSpace, i);
  let e = `mat3( ${vy.elements.map((t) => t.toFixed(4))} )`;
  switch (Kt.getTransfer(i)) {
    case Yl:
      return [e, "LinearTransferOETF"];
    case bn:
      return [e, "sRGBTransferOETF"];
    default:
      return (
        console.warn("THREE.WebGLProgram: Unsupported color space: ", i),
        [e, "LinearTransferOETF"]
      );
  }
}
function xy(i, e, t) {
  let n = i.getShaderParameter(e, i.COMPILE_STATUS),
    o = (i.getShaderInfoLog(e) || "").trim();
  if (n && o === "") return "";
  let r = /ERROR: 0:(\d+)/.exec(o);
  if (r) {
    let a = parseInt(r[1]);
    return (
      t.toUpperCase() +
      `

` +
      o +
      `

` +
      e6(i.getShaderSource(e), a)
    );
  } else return o;
}
function n6(i, e) {
  let t = t6(e);
  return [
    `vec4 ${i}( vec4 value ) {`,
    `	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,
    "}",
  ].join(`
`);
}
function i6(i, e) {
  let t;
  switch (e) {
    case V2:
      t = "Linear";
      break;
    case W2:
      t = "Reinhard";
      break;
    case G2:
      t = "Cineon";
      break;
    case xc:
      t = "ACESFilmic";
      break;
    case X2:
      t = "AgX";
      break;
    case Y2:
      t = "Neutral";
      break;
    case q2:
      t = "Custom";
      break;
    default:
      console.warn("THREE.WebGLProgram: Unsupported toneMapping:", e), (t = "Linear");
  }
  return "vec3 " + i + "( vec3 color ) { return " + t + "ToneMapping( color ); }";
}
var e1 = new W();
function s6() {
  Kt.getLuminanceCoefficients(e1);
  let i = e1.x.toFixed(4),
    e = e1.y.toFixed(4),
    t = e1.z.toFixed(4);
  return [
    "float luminance( const in vec3 rgb ) {",
    `	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,
    "	return dot( weights, rgb );",
    "}",
  ].join(`
`);
}
function o6(i) {
  return [
    i.extensionClipCullDistance ? "#extension GL_ANGLE_clip_cull_distance : require" : "",
    i.extensionMultiDraw ? "#extension GL_ANGLE_multi_draw : require" : "",
  ].filter(mf).join(`
`);
}
function r6(i) {
  let e = [];
  for (let t in i) {
    let n = i[t];
    n !== !1 && e.push("#define " + t + " " + n);
  }
  return e.join(`
`);
}
function a6(i, e) {
  let t = {},
    n = i.getProgramParameter(e, i.ACTIVE_ATTRIBUTES);
  for (let s = 0; s < n; s++) {
    let o = i.getActiveAttrib(e, s),
      r = o.name,
      a = 1;
    o.type === i.FLOAT_MAT2 && (a = 2),
      o.type === i.FLOAT_MAT3 && (a = 3),
      o.type === i.FLOAT_MAT4 && (a = 4),
      (t[r] = { type: o.type, location: i.getAttribLocation(e, r), locationSize: a });
  }
  return t;
}
function mf(i) {
  return i !== "";
}
function yy(i, e) {
  let t = e.numSpotLightShadows + e.numSpotLightMaps - e.numSpotLightShadowsWithMaps;
  return i
    .replace(/NUM_DIR_LIGHTS/g, e.numDirLights)
    .replace(/NUM_SPOT_LIGHTS/g, e.numSpotLights)
    .replace(/NUM_SPOT_LIGHT_MAPS/g, e.numSpotLightMaps)
    .replace(/NUM_SPOT_LIGHT_COORDS/g, t)
    .replace(/NUM_RECT_AREA_LIGHTS/g, e.numRectAreaLights)
    .replace(/NUM_POINT_LIGHTS/g, e.numPointLights)
    .replace(/NUM_HEMI_LIGHTS/g, e.numHemiLights)
    .replace(/NUM_DIR_LIGHT_SHADOWS/g, e.numDirLightShadows)
    .replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, e.numSpotLightShadowsWithMaps)
    .replace(/NUM_SPOT_LIGHT_SHADOWS/g, e.numSpotLightShadows)
    .replace(/NUM_POINT_LIGHT_SHADOWS/g, e.numPointLightShadows);
}
function by(i, e) {
  return i
    .replace(/NUM_CLIPPING_PLANES/g, e.numClippingPlanes)
    .replace(/UNION_CLIPPING_PLANES/g, e.numClippingPlanes - e.numClipIntersection);
}
var l6 = /^[ \t]*#include +<([\w\d./]+)>/gm;
function Pg(i) {
  return i.replace(l6, u6);
}
var c6 = new Map();
function u6(i, e) {
  let t = It[e];
  if (t === void 0) {
    let n = c6.get(e);
    if (n !== void 0)
      (t = It[n]),
        console.warn(
          'THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',
          e,
          n,
        );
    else throw new Error("Can not resolve #include <" + e + ">");
  }
  return Pg(t);
}
var h6 =
  /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
function _y(i) {
  return i.replace(h6, f6);
}
function f6(i, e, t, n) {
  let s = "";
  for (let o = parseInt(e); o < parseInt(t); o++)
    s += n.replace(/\[\s*i\s*\]/g, "[ " + o + " ]").replace(/UNROLLED_LOOP_INDEX/g, o);
  return s;
}
function My(i) {
  let e = `precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;
  return (
    i.precision === "highp"
      ? (e += `
#define HIGH_PRECISION`)
      : i.precision === "mediump"
        ? (e += `
#define MEDIUM_PRECISION`)
        : i.precision === "lowp" &&
          (e += `
#define LOW_PRECISION`),
    e
  );
}
function d6(i) {
  let e = "SHADOWMAP_TYPE_BASIC";
  return (
    i.shadowMapType === gc
      ? (e = "SHADOWMAP_TYPE_PCF")
      : i.shadowMapType === Eh
        ? (e = "SHADOWMAP_TYPE_PCF_SOFT")
        : i.shadowMapType === ur && (e = "SHADOWMAP_TYPE_VSM"),
    e
  );
}
function p6(i) {
  let e = "ENVMAP_TYPE_CUBE";
  if (i.envMap)
    switch (i.envMapMode) {
      case Cr:
      case ta:
        e = "ENVMAP_TYPE_CUBE";
        break;
      case X0:
        e = "ENVMAP_TYPE_CUBE_UV";
        break;
    }
  return e;
}
function m6(i) {
  let e = "ENVMAP_MODE_REFLECTION";
  return i.envMap && i.envMapMode === ta && (e = "ENVMAP_MODE_REFRACTION"), e;
}
function g6(i) {
  let e = "ENVMAP_BLENDING_NONE";
  if (i.envMap)
    switch (i.combine) {
      case vc:
        e = "ENVMAP_BLENDING_MULTIPLY";
        break;
      case O2:
        e = "ENVMAP_BLENDING_MIX";
        break;
      case H2:
        e = "ENVMAP_BLENDING_ADD";
        break;
    }
  return e;
}
function v6(i) {
  let e = i.envMapCubeUVHeight;
  if (e === null) return null;
  let t = Math.log2(e) - 2,
    n = 1 / e;
  return { texelWidth: 1 / (3 * Math.max(Math.pow(2, t), 112)), texelHeight: n, maxMip: t };
}
function x6(i, e, t, n) {
  let s = i.getContext(),
    o = t.defines,
    r = t.vertexShader,
    a = t.fragmentShader,
    l = d6(t),
    c = p6(t),
    u = m6(t),
    h = g6(t),
    f = v6(t),
    p = o6(t),
    d = r6(o),
    v = s.createProgram(),
    g,
    x,
    y = t.glslVersion
      ? "#version " +
        t.glslVersion +
        `
`
      : "";
  t.isRawShaderMaterial
    ? ((g = [
        "#define SHADER_TYPE " + t.shaderType,
        "#define SHADER_NAME " + t.shaderName,
        d,
      ].filter(mf).join(`
`)),
      g.length > 0 &&
        (g += `
`),
      (x = [
        "#define SHADER_TYPE " + t.shaderType,
        "#define SHADER_NAME " + t.shaderName,
        d,
      ].filter(mf).join(`
`)),
      x.length > 0 &&
        (x += `
`))
    : ((g = [
        My(t),
        "#define SHADER_TYPE " + t.shaderType,
        "#define SHADER_NAME " + t.shaderName,
        d,
        t.extensionClipCullDistance ? "#define USE_CLIP_DISTANCE" : "",
        t.batching ? "#define USE_BATCHING" : "",
        t.batchingColor ? "#define USE_BATCHING_COLOR" : "",
        t.instancing ? "#define USE_INSTANCING" : "",
        t.instancingColor ? "#define USE_INSTANCING_COLOR" : "",
        t.instancingMorph ? "#define USE_INSTANCING_MORPH" : "",
        t.useFog && t.fog ? "#define USE_FOG" : "",
        t.useFog && t.fogExp2 ? "#define FOG_EXP2" : "",
        t.map ? "#define USE_MAP" : "",
        t.envMap ? "#define USE_ENVMAP" : "",
        t.envMap ? "#define " + u : "",
        t.lightMap ? "#define USE_LIGHTMAP" : "",
        t.aoMap ? "#define USE_AOMAP" : "",
        t.bumpMap ? "#define USE_BUMPMAP" : "",
        t.normalMap ? "#define USE_NORMALMAP" : "",
        t.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "",
        t.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "",
        t.displacementMap ? "#define USE_DISPLACEMENTMAP" : "",
        t.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
        t.anisotropy ? "#define USE_ANISOTROPY" : "",
        t.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "",
        t.clearcoatMap ? "#define USE_CLEARCOATMAP" : "",
        t.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "",
        t.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "",
        t.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "",
        t.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "",
        t.specularMap ? "#define USE_SPECULARMAP" : "",
        t.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "",
        t.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "",
        t.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
        t.metalnessMap ? "#define USE_METALNESSMAP" : "",
        t.alphaMap ? "#define USE_ALPHAMAP" : "",
        t.alphaHash ? "#define USE_ALPHAHASH" : "",
        t.transmission ? "#define USE_TRANSMISSION" : "",
        t.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "",
        t.thicknessMap ? "#define USE_THICKNESSMAP" : "",
        t.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "",
        t.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "",
        t.mapUv ? "#define MAP_UV " + t.mapUv : "",
        t.alphaMapUv ? "#define ALPHAMAP_UV " + t.alphaMapUv : "",
        t.lightMapUv ? "#define LIGHTMAP_UV " + t.lightMapUv : "",
        t.aoMapUv ? "#define AOMAP_UV " + t.aoMapUv : "",
        t.emissiveMapUv ? "#define EMISSIVEMAP_UV " + t.emissiveMapUv : "",
        t.bumpMapUv ? "#define BUMPMAP_UV " + t.bumpMapUv : "",
        t.normalMapUv ? "#define NORMALMAP_UV " + t.normalMapUv : "",
        t.displacementMapUv ? "#define DISPLACEMENTMAP_UV " + t.displacementMapUv : "",
        t.metalnessMapUv ? "#define METALNESSMAP_UV " + t.metalnessMapUv : "",
        t.roughnessMapUv ? "#define ROUGHNESSMAP_UV " + t.roughnessMapUv : "",
        t.anisotropyMapUv ? "#define ANISOTROPYMAP_UV " + t.anisotropyMapUv : "",
        t.clearcoatMapUv ? "#define CLEARCOATMAP_UV " + t.clearcoatMapUv : "",
        t.clearcoatNormalMapUv ? "#define CLEARCOAT_NORMALMAP_UV " + t.clearcoatNormalMapUv : "",
        t.clearcoatRoughnessMapUv
          ? "#define CLEARCOAT_ROUGHNESSMAP_UV " + t.clearcoatRoughnessMapUv
          : "",
        t.iridescenceMapUv ? "#define IRIDESCENCEMAP_UV " + t.iridescenceMapUv : "",
        t.iridescenceThicknessMapUv
          ? "#define IRIDESCENCE_THICKNESSMAP_UV " + t.iridescenceThicknessMapUv
          : "",
        t.sheenColorMapUv ? "#define SHEEN_COLORMAP_UV " + t.sheenColorMapUv : "",
        t.sheenRoughnessMapUv ? "#define SHEEN_ROUGHNESSMAP_UV " + t.sheenRoughnessMapUv : "",
        t.specularMapUv ? "#define SPECULARMAP_UV " + t.specularMapUv : "",
        t.specularColorMapUv ? "#define SPECULAR_COLORMAP_UV " + t.specularColorMapUv : "",
        t.specularIntensityMapUv
          ? "#define SPECULAR_INTENSITYMAP_UV " + t.specularIntensityMapUv
          : "",
        t.transmissionMapUv ? "#define TRANSMISSIONMAP_UV " + t.transmissionMapUv : "",
        t.thicknessMapUv ? "#define THICKNESSMAP_UV " + t.thicknessMapUv : "",
        t.vertexTangents && t.flatShading === !1 ? "#define USE_TANGENT" : "",
        t.vertexColors ? "#define USE_COLOR" : "",
        t.vertexAlphas ? "#define USE_COLOR_ALPHA" : "",
        t.vertexUv1s ? "#define USE_UV1" : "",
        t.vertexUv2s ? "#define USE_UV2" : "",
        t.vertexUv3s ? "#define USE_UV3" : "",
        t.pointsUvs ? "#define USE_POINTS_UV" : "",
        t.flatShading ? "#define FLAT_SHADED" : "",
        t.skinning ? "#define USE_SKINNING" : "",
        t.morphTargets ? "#define USE_MORPHTARGETS" : "",
        t.morphNormals && t.flatShading === !1 ? "#define USE_MORPHNORMALS" : "",
        t.morphColors ? "#define USE_MORPHCOLORS" : "",
        t.morphTargetsCount > 0
          ? "#define MORPHTARGETS_TEXTURE_STRIDE " + t.morphTextureStride
          : "",
        t.morphTargetsCount > 0 ? "#define MORPHTARGETS_COUNT " + t.morphTargetsCount : "",
        t.doubleSided ? "#define DOUBLE_SIDED" : "",
        t.flipSided ? "#define FLIP_SIDED" : "",
        t.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
        t.shadowMapEnabled ? "#define " + l : "",
        t.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "",
        t.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "",
        t.logarithmicDepthBuffer ? "#define USE_LOGARITHMIC_DEPTH_BUFFER" : "",
        t.reversedDepthBuffer ? "#define USE_REVERSED_DEPTH_BUFFER" : "",
        "uniform mat4 modelMatrix;",
        "uniform mat4 modelViewMatrix;",
        "uniform mat4 projectionMatrix;",
        "uniform mat4 viewMatrix;",
        "uniform mat3 normalMatrix;",
        "uniform vec3 cameraPosition;",
        "uniform bool isOrthographic;",
        "#ifdef USE_INSTANCING",
        "	attribute mat4 instanceMatrix;",
        "#endif",
        "#ifdef USE_INSTANCING_COLOR",
        "	attribute vec3 instanceColor;",
        "#endif",
        "#ifdef USE_INSTANCING_MORPH",
        "	uniform sampler2D morphTexture;",
        "#endif",
        "attribute vec3 position;",
        "attribute vec3 normal;",
        "attribute vec2 uv;",
        "#ifdef USE_UV1",
        "	attribute vec2 uv1;",
        "#endif",
        "#ifdef USE_UV2",
        "	attribute vec2 uv2;",
        "#endif",
        "#ifdef USE_UV3",
        "	attribute vec2 uv3;",
        "#endif",
        "#ifdef USE_TANGENT",
        "	attribute vec4 tangent;",
        "#endif",
        "#if defined( USE_COLOR_ALPHA )",
        "	attribute vec4 color;",
        "#elif defined( USE_COLOR )",
        "	attribute vec3 color;",
        "#endif",
        "#ifdef USE_SKINNING",
        "	attribute vec4 skinIndex;",
        "	attribute vec4 skinWeight;",
        "#endif",
        `
`,
      ].filter(mf).join(`
`)),
      (x = [
        My(t),
        "#define SHADER_TYPE " + t.shaderType,
        "#define SHADER_NAME " + t.shaderName,
        d,
        t.useFog && t.fog ? "#define USE_FOG" : "",
        t.useFog && t.fogExp2 ? "#define FOG_EXP2" : "",
        t.alphaToCoverage ? "#define ALPHA_TO_COVERAGE" : "",
        t.map ? "#define USE_MAP" : "",
        t.matcap ? "#define USE_MATCAP" : "",
        t.envMap ? "#define USE_ENVMAP" : "",
        t.envMap ? "#define " + c : "",
        t.envMap ? "#define " + u : "",
        t.envMap ? "#define " + h : "",
        f ? "#define CUBEUV_TEXEL_WIDTH " + f.texelWidth : "",
        f ? "#define CUBEUV_TEXEL_HEIGHT " + f.texelHeight : "",
        f ? "#define CUBEUV_MAX_MIP " + f.maxMip + ".0" : "",
        t.lightMap ? "#define USE_LIGHTMAP" : "",
        t.aoMap ? "#define USE_AOMAP" : "",
        t.bumpMap ? "#define USE_BUMPMAP" : "",
        t.normalMap ? "#define USE_NORMALMAP" : "",
        t.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "",
        t.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "",
        t.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
        t.anisotropy ? "#define USE_ANISOTROPY" : "",
        t.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "",
        t.clearcoat ? "#define USE_CLEARCOAT" : "",
        t.clearcoatMap ? "#define USE_CLEARCOATMAP" : "",
        t.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "",
        t.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "",
        t.dispersion ? "#define USE_DISPERSION" : "",
        t.iridescence ? "#define USE_IRIDESCENCE" : "",
        t.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "",
        t.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "",
        t.specularMap ? "#define USE_SPECULARMAP" : "",
        t.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "",
        t.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "",
        t.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
        t.metalnessMap ? "#define USE_METALNESSMAP" : "",
        t.alphaMap ? "#define USE_ALPHAMAP" : "",
        t.alphaTest ? "#define USE_ALPHATEST" : "",
        t.alphaHash ? "#define USE_ALPHAHASH" : "",
        t.sheen ? "#define USE_SHEEN" : "",
        t.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "",
        t.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "",
        t.transmission ? "#define USE_TRANSMISSION" : "",
        t.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "",
        t.thicknessMap ? "#define USE_THICKNESSMAP" : "",
        t.vertexTangents && t.flatShading === !1 ? "#define USE_TANGENT" : "",
        t.vertexColors || t.instancingColor || t.batchingColor ? "#define USE_COLOR" : "",
        t.vertexAlphas ? "#define USE_COLOR_ALPHA" : "",
        t.vertexUv1s ? "#define USE_UV1" : "",
        t.vertexUv2s ? "#define USE_UV2" : "",
        t.vertexUv3s ? "#define USE_UV3" : "",
        t.pointsUvs ? "#define USE_POINTS_UV" : "",
        t.gradientMap ? "#define USE_GRADIENTMAP" : "",
        t.flatShading ? "#define FLAT_SHADED" : "",
        t.doubleSided ? "#define DOUBLE_SIDED" : "",
        t.flipSided ? "#define FLIP_SIDED" : "",
        t.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
        t.shadowMapEnabled ? "#define " + l : "",
        t.premultipliedAlpha ? "#define PREMULTIPLIED_ALPHA" : "",
        t.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "",
        t.decodeVideoTexture ? "#define DECODE_VIDEO_TEXTURE" : "",
        t.decodeVideoTextureEmissive ? "#define DECODE_VIDEO_TEXTURE_EMISSIVE" : "",
        t.logarithmicDepthBuffer ? "#define USE_LOGARITHMIC_DEPTH_BUFFER" : "",
        t.reversedDepthBuffer ? "#define USE_REVERSED_DEPTH_BUFFER" : "",
        "uniform mat4 viewMatrix;",
        "uniform vec3 cameraPosition;",
        "uniform bool isOrthographic;",
        t.toneMapping !== ys ? "#define TONE_MAPPING" : "",
        t.toneMapping !== ys ? It.tonemapping_pars_fragment : "",
        t.toneMapping !== ys ? i6("toneMapping", t.toneMapping) : "",
        t.dithering ? "#define DITHERING" : "",
        t.opaque ? "#define OPAQUE" : "",
        It.colorspace_pars_fragment,
        n6("linearToOutputTexel", t.outputColorSpace),
        s6(),
        t.useDepthPacking ? "#define DEPTH_PACKING " + t.depthPacking : "",
        `
`,
      ].filter(mf).join(`
`))),
    (r = Pg(r)),
    (r = yy(r, t)),
    (r = by(r, t)),
    (a = Pg(a)),
    (a = yy(a, t)),
    (a = by(a, t)),
    (r = _y(r)),
    (a = _y(a)),
    t.isRawShaderMaterial !== !0 &&
      ((y = `#version 300 es
`),
      (g =
        [p, "#define attribute in", "#define varying out", "#define texture2D texture"].join(`
`) +
        `
` +
        g),
      (x =
        [
          "#define varying in",
          t.glslVersion === Ac ? "" : "layout(location = 0) out highp vec4 pc_fragColor;",
          t.glslVersion === Ac ? "" : "#define gl_FragColor pc_fragColor",
          "#define gl_FragDepthEXT gl_FragDepth",
          "#define texture2D texture",
          "#define textureCube texture",
          "#define texture2DProj textureProj",
          "#define texture2DLodEXT textureLod",
          "#define texture2DProjLodEXT textureProjLod",
          "#define textureCubeLodEXT textureLod",
          "#define texture2DGradEXT textureGrad",
          "#define texture2DProjGradEXT textureProjGrad",
          "#define textureCubeGradEXT textureGrad",
        ].join(`
`) +
        `
` +
        x));
  let b = y + g + r,
    m = y + x + a,
    A = gy(s, s.VERTEX_SHADER, b),
    _ = gy(s, s.FRAGMENT_SHADER, m);
  s.attachShader(v, A),
    s.attachShader(v, _),
    t.index0AttributeName !== void 0
      ? s.bindAttribLocation(v, 0, t.index0AttributeName)
      : t.morphTargets === !0 && s.bindAttribLocation(v, 0, "position"),
    s.linkProgram(v);
  function M(z) {
    if (i.debug.checkShaderErrors) {
      let H = s.getProgramInfoLog(v) || "",
        O = s.getShaderInfoLog(A) || "",
        q = s.getShaderInfoLog(_) || "",
        U = H.trim(),
        T = O.trim(),
        D = q.trim(),
        C = !0,
        G = !0;
      if (s.getProgramParameter(v, s.LINK_STATUS) === !1)
        if (((C = !1), typeof i.debug.onShaderError == "function"))
          i.debug.onShaderError(s, v, A, _);
        else {
          let j = xy(s, A, "vertex"),
            N = xy(s, _, "fragment");
          console.error(
            "THREE.WebGLProgram: Shader Error " +
              s.getError() +
              " - VALIDATE_STATUS " +
              s.getProgramParameter(v, s.VALIDATE_STATUS) +
              `

Material Name: ` +
              z.name +
              `
Material Type: ` +
              z.type +
              `

Program Info Log: ` +
              U +
              `
` +
              j +
              `
` +
              N,
          );
        }
      else
        U !== ""
          ? console.warn("THREE.WebGLProgram: Program Info Log:", U)
          : (T === "" || D === "") && (G = !1);
      G &&
        (z.diagnostics = {
          runnable: C,
          programLog: U,
          vertexShader: { log: T, prefix: g },
          fragmentShader: { log: D, prefix: x },
        });
    }
    s.deleteShader(A), s.deleteShader(_), (E = new Pc(s, v)), (w = a6(s, v));
  }
  let E;
  this.getUniforms = function () {
    return E === void 0 && M(this), E;
  };
  let w;
  this.getAttributes = function () {
    return w === void 0 && M(this), w;
  };
  let S = t.rendererExtensionParallelShaderCompile === !1;
  return (
    (this.isReady = function () {
      return S === !1 && (S = s.getProgramParameter(v, KT)), S;
    }),
    (this.destroy = function () {
      n.releaseStatesOfProgram(this), s.deleteProgram(v), (this.program = void 0);
    }),
    (this.type = t.shaderType),
    (this.name = t.shaderName),
    (this.id = QT++),
    (this.cacheKey = e),
    (this.usedTimes = 1),
    (this.program = v),
    (this.vertexShader = A),
    (this.fragmentShader = _),
    this
  );
}
var y6 = 0,
  Ig = class {
    constructor() {
      (this.shaderCache = new Map()), (this.materialCache = new Map());
    }
    update(e) {
      let t = e.vertexShader,
        n = e.fragmentShader,
        s = this._getShaderStage(t),
        o = this._getShaderStage(n),
        r = this._getShaderCacheForMaterial(e);
      return (
        r.has(s) === !1 && (r.add(s), s.usedTimes++),
        r.has(o) === !1 && (r.add(o), o.usedTimes++),
        this
      );
    }
    remove(e) {
      let t = this.materialCache.get(e);
      for (let n of t) n.usedTimes--, n.usedTimes === 0 && this.shaderCache.delete(n.code);
      return this.materialCache.delete(e), this;
    }
    getVertexShaderID(e) {
      return this._getShaderStage(e.vertexShader).id;
    }
    getFragmentShaderID(e) {
      return this._getShaderStage(e.fragmentShader).id;
    }
    dispose() {
      this.shaderCache.clear(), this.materialCache.clear();
    }
    _getShaderCacheForMaterial(e) {
      let t = this.materialCache,
        n = t.get(e);
      return n === void 0 && ((n = new Set()), t.set(e, n)), n;
    }
    _getShaderStage(e) {
      let t = this.shaderCache,
        n = t.get(e);
      return n === void 0 && ((n = new zg(e)), t.set(e, n)), n;
    }
  },
  zg = class {
    constructor(e) {
      (this.id = y6++), (this.code = e), (this.usedTimes = 0);
    }
  };
function b6(i, e, t, n, s, o, r) {
  let a = new C0(),
    l = new Ig(),
    c = new Set(),
    u = [],
    h = s.logarithmicDepthBuffer,
    f = s.vertexTextures,
    p = s.precision,
    d = {
      MeshDepthMaterial: "depth",
      MeshDistanceMaterial: "distanceRGBA",
      MeshNormalMaterial: "normal",
      MeshBasicMaterial: "basic",
      MeshLambertMaterial: "lambert",
      MeshPhongMaterial: "phong",
      MeshToonMaterial: "toon",
      MeshStandardMaterial: "physical",
      MeshPhysicalMaterial: "physical",
      MeshMatcapMaterial: "matcap",
      LineBasicMaterial: "basic",
      LineDashedMaterial: "dashed",
      PointsMaterial: "points",
      ShadowMaterial: "shadow",
      SpriteMaterial: "sprite",
    };
  function v(w) {
    return c.add(w), w === 0 ? "uv" : `uv${w}`;
  }
  function g(w, S, z, H, O) {
    let q = H.fog,
      U = O.geometry,
      T = w.isMeshStandardMaterial ? H.environment : null,
      D = (w.isMeshStandardMaterial ? t : e).get(w.envMap || T),
      C = D && D.mapping === X0 ? D.image.height : null,
      G = d[w.type];
    w.precision !== null &&
      ((p = s.getMaxPrecision(w.precision)),
      p !== w.precision &&
        console.warn(
          "THREE.WebGLProgram.getParameters:",
          w.precision,
          "not supported, using",
          p,
          "instead.",
        ));
    let j = U.morphAttributes.position || U.morphAttributes.normal || U.morphAttributes.color,
      N = j !== void 0 ? j.length : 0,
      Q = 0;
    U.morphAttributes.position !== void 0 && (Q = 1),
      U.morphAttributes.normal !== void 0 && (Q = 2),
      U.morphAttributes.color !== void 0 && (Q = 3);
    let K, ie, F, X;
    if (G) {
      let ut = fr[G];
      (K = ut.vertexShader), (ie = ut.fragmentShader);
    } else
      (K = w.vertexShader),
        (ie = w.fragmentShader),
        l.update(w),
        (F = l.getVertexShaderID(w)),
        (X = l.getFragmentShaderID(w));
    let ne = i.getRenderTarget(),
      re = i.state.buffers.depth.getReversed(),
      $ = O.isInstancedMesh === !0,
      ue = O.isBatchedMesh === !0,
      me = !!w.map,
      ee = !!w.matcap,
      B = !!D,
      P = !!w.aoMap,
      V = !!w.lightMap,
      Y = !!w.bumpMap,
      L = !!w.normalMap,
      Z = !!w.displacementMap,
      J = !!w.emissiveMap,
      oe = !!w.metalnessMap,
      fe = !!w.roughnessMap,
      le = w.anisotropy > 0,
      R = w.clearcoat > 0,
      I = w.dispersion > 0,
      se = w.iridescence > 0,
      ae = w.sheen > 0,
      k = w.transmission > 0,
      ce = le && !!w.anisotropyMap,
      ve = R && !!w.clearcoatMap,
      _e = R && !!w.clearcoatNormalMap,
      Te = R && !!w.clearcoatRoughnessMap,
      Pe = se && !!w.iridescenceMap,
      Re = se && !!w.iridescenceThicknessMap,
      Fe = ae && !!w.sheenColorMap,
      ze = ae && !!w.sheenRoughnessMap,
      We = !!w.specularMap,
      Ne = !!w.specularColorMap,
      dt = !!w.specularIntensityMap,
      xe = k && !!w.transmissionMap,
      Ie = k && !!w.thicknessMap,
      Be = !!w.gradientMap,
      Xe = !!w.alphaMap,
      Me = w.alphaTest > 0,
      we = !!w.alphaHash,
      be = !!w.extensions,
      Oe = ys;
    w.toneMapped && (ne === null || ne.isXRRenderTarget === !0) && (Oe = i.toneMapping);
    let pt = {
      shaderID: G,
      shaderType: w.type,
      shaderName: w.name,
      vertexShader: K,
      fragmentShader: ie,
      defines: w.defines,
      customVertexShaderID: F,
      customFragmentShaderID: X,
      isRawShaderMaterial: w.isRawShaderMaterial === !0,
      glslVersion: w.glslVersion,
      precision: p,
      batching: ue,
      batchingColor: ue && O._colorsTexture !== null,
      instancing: $,
      instancingColor: $ && O.instanceColor !== null,
      instancingMorph: $ && O.morphTexture !== null,
      supportsVertexTextures: f,
      outputColorSpace:
        ne === null
          ? i.outputColorSpace
          : ne.isXRRenderTarget === !0
            ? ne.texture.colorSpace
            : Er,
      alphaToCoverage: !!w.alphaToCoverage,
      map: me,
      matcap: ee,
      envMap: B,
      envMapMode: B && D.mapping,
      envMapCubeUVHeight: C,
      aoMap: P,
      lightMap: V,
      bumpMap: Y,
      normalMap: L,
      displacementMap: f && Z,
      emissiveMap: J,
      normalMapObjectSpace: L && w.normalMapType === ig,
      normalMapTangentSpace: L && w.normalMapType === na,
      metalnessMap: oe,
      roughnessMap: fe,
      anisotropy: le,
      anisotropyMap: ce,
      clearcoat: R,
      clearcoatMap: ve,
      clearcoatNormalMap: _e,
      clearcoatRoughnessMap: Te,
      dispersion: I,
      iridescence: se,
      iridescenceMap: Pe,
      iridescenceThicknessMap: Re,
      sheen: ae,
      sheenColorMap: Fe,
      sheenRoughnessMap: ze,
      specularMap: We,
      specularColorMap: Ne,
      specularIntensityMap: dt,
      transmission: k,
      transmissionMap: xe,
      thicknessMap: Ie,
      gradientMap: Be,
      opaque: w.transparent === !1 && w.blending === Ia && w.alphaToCoverage === !1,
      alphaMap: Xe,
      alphaTest: Me,
      alphaHash: we,
      combine: w.combine,
      mapUv: me && v(w.map.channel),
      aoMapUv: P && v(w.aoMap.channel),
      lightMapUv: V && v(w.lightMap.channel),
      bumpMapUv: Y && v(w.bumpMap.channel),
      normalMapUv: L && v(w.normalMap.channel),
      displacementMapUv: Z && v(w.displacementMap.channel),
      emissiveMapUv: J && v(w.emissiveMap.channel),
      metalnessMapUv: oe && v(w.metalnessMap.channel),
      roughnessMapUv: fe && v(w.roughnessMap.channel),
      anisotropyMapUv: ce && v(w.anisotropyMap.channel),
      clearcoatMapUv: ve && v(w.clearcoatMap.channel),
      clearcoatNormalMapUv: _e && v(w.clearcoatNormalMap.channel),
      clearcoatRoughnessMapUv: Te && v(w.clearcoatRoughnessMap.channel),
      iridescenceMapUv: Pe && v(w.iridescenceMap.channel),
      iridescenceThicknessMapUv: Re && v(w.iridescenceThicknessMap.channel),
      sheenColorMapUv: Fe && v(w.sheenColorMap.channel),
      sheenRoughnessMapUv: ze && v(w.sheenRoughnessMap.channel),
      specularMapUv: We && v(w.specularMap.channel),
      specularColorMapUv: Ne && v(w.specularColorMap.channel),
      specularIntensityMapUv: dt && v(w.specularIntensityMap.channel),
      transmissionMapUv: xe && v(w.transmissionMap.channel),
      thicknessMapUv: Ie && v(w.thicknessMap.channel),
      alphaMapUv: Xe && v(w.alphaMap.channel),
      vertexTangents: !!U.attributes.tangent && (L || le),
      vertexColors: w.vertexColors,
      vertexAlphas:
        w.vertexColors === !0 && !!U.attributes.color && U.attributes.color.itemSize === 4,
      pointsUvs: O.isPoints === !0 && !!U.attributes.uv && (me || Xe),
      fog: !!q,
      useFog: w.fog === !0,
      fogExp2: !!q && q.isFogExp2,
      flatShading: w.flatShading === !0 && w.wireframe === !1,
      sizeAttenuation: w.sizeAttenuation === !0,
      logarithmicDepthBuffer: h,
      reversedDepthBuffer: re,
      skinning: O.isSkinnedMesh === !0,
      morphTargets: U.morphAttributes.position !== void 0,
      morphNormals: U.morphAttributes.normal !== void 0,
      morphColors: U.morphAttributes.color !== void 0,
      morphTargetsCount: N,
      morphTextureStride: Q,
      numDirLights: S.directional.length,
      numPointLights: S.point.length,
      numSpotLights: S.spot.length,
      numSpotLightMaps: S.spotLightMap.length,
      numRectAreaLights: S.rectArea.length,
      numHemiLights: S.hemi.length,
      numDirLightShadows: S.directionalShadowMap.length,
      numPointLightShadows: S.pointShadowMap.length,
      numSpotLightShadows: S.spotShadowMap.length,
      numSpotLightShadowsWithMaps: S.numSpotLightShadowsWithMaps,
      numLightProbes: S.numLightProbes,
      numClippingPlanes: r.numPlanes,
      numClipIntersection: r.numIntersection,
      dithering: w.dithering,
      shadowMapEnabled: i.shadowMap.enabled && z.length > 0,
      shadowMapType: i.shadowMap.type,
      toneMapping: Oe,
      decodeVideoTexture:
        me && w.map.isVideoTexture === !0 && Kt.getTransfer(w.map.colorSpace) === bn,
      decodeVideoTextureEmissive:
        J &&
        w.emissiveMap.isVideoTexture === !0 &&
        Kt.getTransfer(w.emissiveMap.colorSpace) === bn,
      premultipliedAlpha: w.premultipliedAlpha,
      doubleSided: w.side === Sn,
      flipSided: w.side === Ki,
      useDepthPacking: w.depthPacking >= 0,
      depthPacking: w.depthPacking || 0,
      index0AttributeName: w.index0AttributeName,
      extensionClipCullDistance:
        be && w.extensions.clipCullDistance === !0 && n.has("WEBGL_clip_cull_distance"),
      extensionMultiDraw:
        ((be && w.extensions.multiDraw === !0) || ue) && n.has("WEBGL_multi_draw"),
      rendererExtensionParallelShaderCompile: n.has("KHR_parallel_shader_compile"),
      customProgramCacheKey: w.customProgramCacheKey(),
    };
    return (
      (pt.vertexUv1s = c.has(1)),
      (pt.vertexUv2s = c.has(2)),
      (pt.vertexUv3s = c.has(3)),
      c.clear(),
      pt
    );
  }
  function x(w) {
    let S = [];
    if (
      (w.shaderID
        ? S.push(w.shaderID)
        : (S.push(w.customVertexShaderID), S.push(w.customFragmentShaderID)),
      w.defines !== void 0)
    )
      for (let z in w.defines) S.push(z), S.push(w.defines[z]);
    return (
      w.isRawShaderMaterial === !1 && (y(S, w), b(S, w), S.push(i.outputColorSpace)),
      S.push(w.customProgramCacheKey),
      S.join()
    );
  }
  function y(w, S) {
    w.push(S.precision),
      w.push(S.outputColorSpace),
      w.push(S.envMapMode),
      w.push(S.envMapCubeUVHeight),
      w.push(S.mapUv),
      w.push(S.alphaMapUv),
      w.push(S.lightMapUv),
      w.push(S.aoMapUv),
      w.push(S.bumpMapUv),
      w.push(S.normalMapUv),
      w.push(S.displacementMapUv),
      w.push(S.emissiveMapUv),
      w.push(S.metalnessMapUv),
      w.push(S.roughnessMapUv),
      w.push(S.anisotropyMapUv),
      w.push(S.clearcoatMapUv),
      w.push(S.clearcoatNormalMapUv),
      w.push(S.clearcoatRoughnessMapUv),
      w.push(S.iridescenceMapUv),
      w.push(S.iridescenceThicknessMapUv),
      w.push(S.sheenColorMapUv),
      w.push(S.sheenRoughnessMapUv),
      w.push(S.specularMapUv),
      w.push(S.specularColorMapUv),
      w.push(S.specularIntensityMapUv),
      w.push(S.transmissionMapUv),
      w.push(S.thicknessMapUv),
      w.push(S.combine),
      w.push(S.fogExp2),
      w.push(S.sizeAttenuation),
      w.push(S.morphTargetsCount),
      w.push(S.morphAttributeCount),
      w.push(S.numDirLights),
      w.push(S.numPointLights),
      w.push(S.numSpotLights),
      w.push(S.numSpotLightMaps),
      w.push(S.numHemiLights),
      w.push(S.numRectAreaLights),
      w.push(S.numDirLightShadows),
      w.push(S.numPointLightShadows),
      w.push(S.numSpotLightShadows),
      w.push(S.numSpotLightShadowsWithMaps),
      w.push(S.numLightProbes),
      w.push(S.shadowMapType),
      w.push(S.toneMapping),
      w.push(S.numClippingPlanes),
      w.push(S.numClipIntersection),
      w.push(S.depthPacking);
  }
  function b(w, S) {
    a.disableAll(),
      S.supportsVertexTextures && a.enable(0),
      S.instancing && a.enable(1),
      S.instancingColor && a.enable(2),
      S.instancingMorph && a.enable(3),
      S.matcap && a.enable(4),
      S.envMap && a.enable(5),
      S.normalMapObjectSpace && a.enable(6),
      S.normalMapTangentSpace && a.enable(7),
      S.clearcoat && a.enable(8),
      S.iridescence && a.enable(9),
      S.alphaTest && a.enable(10),
      S.vertexColors && a.enable(11),
      S.vertexAlphas && a.enable(12),
      S.vertexUv1s && a.enable(13),
      S.vertexUv2s && a.enable(14),
      S.vertexUv3s && a.enable(15),
      S.vertexTangents && a.enable(16),
      S.anisotropy && a.enable(17),
      S.alphaHash && a.enable(18),
      S.batching && a.enable(19),
      S.dispersion && a.enable(20),
      S.batchingColor && a.enable(21),
      S.gradientMap && a.enable(22),
      w.push(a.mask),
      a.disableAll(),
      S.fog && a.enable(0),
      S.useFog && a.enable(1),
      S.flatShading && a.enable(2),
      S.logarithmicDepthBuffer && a.enable(3),
      S.reversedDepthBuffer && a.enable(4),
      S.skinning && a.enable(5),
      S.morphTargets && a.enable(6),
      S.morphNormals && a.enable(7),
      S.morphColors && a.enable(8),
      S.premultipliedAlpha && a.enable(9),
      S.shadowMapEnabled && a.enable(10),
      S.doubleSided && a.enable(11),
      S.flipSided && a.enable(12),
      S.useDepthPacking && a.enable(13),
      S.dithering && a.enable(14),
      S.transmission && a.enable(15),
      S.sheen && a.enable(16),
      S.opaque && a.enable(17),
      S.pointsUvs && a.enable(18),
      S.decodeVideoTexture && a.enable(19),
      S.decodeVideoTextureEmissive && a.enable(20),
      S.alphaToCoverage && a.enable(21),
      w.push(a.mask);
  }
  function m(w) {
    let S = d[w.type],
      z;
    if (S) {
      let H = fr[S];
      z = mg.clone(H.uniforms);
    } else z = w.uniforms;
    return z;
  }
  function A(w, S) {
    let z;
    for (let H = 0, O = u.length; H < O; H++) {
      let q = u[H];
      if (q.cacheKey === S) {
        (z = q), ++z.usedTimes;
        break;
      }
    }
    return z === void 0 && ((z = new x6(i, S, w, o)), u.push(z)), z;
  }
  function _(w) {
    if (--w.usedTimes === 0) {
      let S = u.indexOf(w);
      (u[S] = u[u.length - 1]), u.pop(), w.destroy();
    }
  }
  function M(w) {
    l.remove(w);
  }
  function E() {
    l.dispose();
  }
  return {
    getParameters: g,
    getProgramCacheKey: x,
    getUniforms: m,
    acquireProgram: A,
    releaseProgram: _,
    releaseShaderCache: M,
    programs: u,
    dispose: E,
  };
}
function _6() {
  let i = new WeakMap();
  function e(r) {
    return i.has(r);
  }
  function t(r) {
    let a = i.get(r);
    return a === void 0 && ((a = {}), i.set(r, a)), a;
  }
  function n(r) {
    i.delete(r);
  }
  function s(r, a, l) {
    i.get(r)[a] = l;
  }
  function o() {
    i = new WeakMap();
  }
  return { has: e, get: t, remove: n, update: s, dispose: o };
}
function M6(i, e) {
  return i.groupOrder !== e.groupOrder
    ? i.groupOrder - e.groupOrder
    : i.renderOrder !== e.renderOrder
      ? i.renderOrder - e.renderOrder
      : i.material.id !== e.material.id
        ? i.material.id - e.material.id
        : i.z !== e.z
          ? i.z - e.z
          : i.id - e.id;
}
function wy(i, e) {
  return i.groupOrder !== e.groupOrder
    ? i.groupOrder - e.groupOrder
    : i.renderOrder !== e.renderOrder
      ? i.renderOrder - e.renderOrder
      : i.z !== e.z
        ? e.z - i.z
        : i.id - e.id;
}
function Ey() {
  let i = [],
    e = 0,
    t = [],
    n = [],
    s = [];
  function o() {
    (e = 0), (t.length = 0), (n.length = 0), (s.length = 0);
  }
  function r(h, f, p, d, v, g) {
    let x = i[e];
    return (
      x === void 0
        ? ((x = {
            id: h.id,
            object: h,
            geometry: f,
            material: p,
            groupOrder: d,
            renderOrder: h.renderOrder,
            z: v,
            group: g,
          }),
          (i[e] = x))
        : ((x.id = h.id),
          (x.object = h),
          (x.geometry = f),
          (x.material = p),
          (x.groupOrder = d),
          (x.renderOrder = h.renderOrder),
          (x.z = v),
          (x.group = g)),
      e++,
      x
    );
  }
  function a(h, f, p, d, v, g) {
    let x = r(h, f, p, d, v, g);
    p.transmission > 0 ? n.push(x) : p.transparent === !0 ? s.push(x) : t.push(x);
  }
  function l(h, f, p, d, v, g) {
    let x = r(h, f, p, d, v, g);
    p.transmission > 0 ? n.unshift(x) : p.transparent === !0 ? s.unshift(x) : t.unshift(x);
  }
  function c(h, f) {
    t.length > 1 && t.sort(h || M6),
      n.length > 1 && n.sort(f || wy),
      s.length > 1 && s.sort(f || wy);
  }
  function u() {
    for (let h = e, f = i.length; h < f; h++) {
      let p = i[h];
      if (p.id === null) break;
      (p.id = null),
        (p.object = null),
        (p.geometry = null),
        (p.material = null),
        (p.group = null);
    }
  }
  return {
    opaque: t,
    transmissive: n,
    transparent: s,
    init: o,
    push: a,
    unshift: l,
    finish: u,
    sort: c,
  };
}
function w6() {
  let i = new WeakMap();
  function e(n, s) {
    let o = i.get(n),
      r;
    return (
      o === void 0
        ? ((r = new Ey()), i.set(n, [r]))
        : s >= o.length
          ? ((r = new Ey()), o.push(r))
          : (r = o[s]),
      r
    );
  }
  function t() {
    i = new WeakMap();
  }
  return { get: e, dispose: t };
}
function E6() {
  let i = {};
  return {
    get: function (e) {
      if (i[e.id] !== void 0) return i[e.id];
      let t;
      switch (e.type) {
        case "DirectionalLight":
          t = { direction: new W(), color: new Ve() };
          break;
        case "SpotLight":
          t = {
            position: new W(),
            direction: new W(),
            color: new Ve(),
            distance: 0,
            coneCos: 0,
            penumbraCos: 0,
            decay: 0,
          };
          break;
        case "PointLight":
          t = { position: new W(), color: new Ve(), distance: 0, decay: 0 };
          break;
        case "HemisphereLight":
          t = { direction: new W(), skyColor: new Ve(), groundColor: new Ve() };
          break;
        case "RectAreaLight":
          t = { color: new Ve(), position: new W(), halfWidth: new W(), halfHeight: new W() };
          break;
      }
      return (i[e.id] = t), t;
    },
  };
}
function S6() {
  let i = {};
  return {
    get: function (e) {
      if (i[e.id] !== void 0) return i[e.id];
      let t;
      switch (e.type) {
        case "DirectionalLight":
          t = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new Ae(),
          };
          break;
        case "SpotLight":
          t = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new Ae(),
          };
          break;
        case "PointLight":
          t = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new Ae(),
            shadowCameraNear: 1,
            shadowCameraFar: 1e3,
          };
          break;
      }
      return (i[e.id] = t), t;
    },
  };
}
var T6 = 0;
function A6(i, e) {
  return (e.castShadow ? 2 : 0) - (i.castShadow ? 2 : 0) + (e.map ? 1 : 0) - (i.map ? 1 : 0);
}
function R6(i) {
  let e = new E6(),
    t = S6(),
    n = {
      version: 0,
      hash: {
        directionalLength: -1,
        pointLength: -1,
        spotLength: -1,
        rectAreaLength: -1,
        hemiLength: -1,
        numDirectionalShadows: -1,
        numPointShadows: -1,
        numSpotShadows: -1,
        numSpotMaps: -1,
        numLightProbes: -1,
      },
      ambient: [0, 0, 0],
      probe: [],
      directional: [],
      directionalShadow: [],
      directionalShadowMap: [],
      directionalShadowMatrix: [],
      spot: [],
      spotLightMap: [],
      spotShadow: [],
      spotShadowMap: [],
      spotLightMatrix: [],
      rectArea: [],
      rectAreaLTC1: null,
      rectAreaLTC2: null,
      point: [],
      pointShadow: [],
      pointShadowMap: [],
      pointShadowMatrix: [],
      hemi: [],
      numSpotLightShadowsWithMaps: 0,
      numLightProbes: 0,
    };
  for (let c = 0; c < 9; c++) n.probe.push(new W());
  let s = new W(),
    o = new Ye(),
    r = new Ye();
  function a(c) {
    let u = 0,
      h = 0,
      f = 0;
    for (let w = 0; w < 9; w++) n.probe[w].set(0, 0, 0);
    let p = 0,
      d = 0,
      v = 0,
      g = 0,
      x = 0,
      y = 0,
      b = 0,
      m = 0,
      A = 0,
      _ = 0,
      M = 0;
    c.sort(A6);
    for (let w = 0, S = c.length; w < S; w++) {
      let z = c[w],
        H = z.color,
        O = z.intensity,
        q = z.distance,
        U = z.shadow && z.shadow.map ? z.shadow.map.texture : null;
      if (z.isAmbientLight) (u += H.r * O), (h += H.g * O), (f += H.b * O);
      else if (z.isLightProbe) {
        for (let T = 0; T < 9; T++) n.probe[T].addScaledVector(z.sh.coefficients[T], O);
        M++;
      } else if (z.isDirectionalLight) {
        let T = e.get(z);
        if ((T.color.copy(z.color).multiplyScalar(z.intensity), z.castShadow)) {
          let D = z.shadow,
            C = t.get(z);
          (C.shadowIntensity = D.intensity),
            (C.shadowBias = D.bias),
            (C.shadowNormalBias = D.normalBias),
            (C.shadowRadius = D.radius),
            (C.shadowMapSize = D.mapSize),
            (n.directionalShadow[p] = C),
            (n.directionalShadowMap[p] = U),
            (n.directionalShadowMatrix[p] = z.shadow.matrix),
            y++;
        }
        (n.directional[p] = T), p++;
      } else if (z.isSpotLight) {
        let T = e.get(z);
        T.position.setFromMatrixPosition(z.matrixWorld),
          T.color.copy(H).multiplyScalar(O),
          (T.distance = q),
          (T.coneCos = Math.cos(z.angle)),
          (T.penumbraCos = Math.cos(z.angle * (1 - z.penumbra))),
          (T.decay = z.decay),
          (n.spot[v] = T);
        let D = z.shadow;
        if (
          (z.map && ((n.spotLightMap[A] = z.map), A++, D.updateMatrices(z), z.castShadow && _++),
          (n.spotLightMatrix[v] = D.matrix),
          z.castShadow)
        ) {
          let C = t.get(z);
          (C.shadowIntensity = D.intensity),
            (C.shadowBias = D.bias),
            (C.shadowNormalBias = D.normalBias),
            (C.shadowRadius = D.radius),
            (C.shadowMapSize = D.mapSize),
            (n.spotShadow[v] = C),
            (n.spotShadowMap[v] = U),
            m++;
        }
        v++;
      } else if (z.isRectAreaLight) {
        let T = e.get(z);
        T.color.copy(H).multiplyScalar(O),
          T.halfWidth.set(z.width * 0.5, 0, 0),
          T.halfHeight.set(0, z.height * 0.5, 0),
          (n.rectArea[g] = T),
          g++;
      } else if (z.isPointLight) {
        let T = e.get(z);
        if (
          (T.color.copy(z.color).multiplyScalar(z.intensity),
          (T.distance = z.distance),
          (T.decay = z.decay),
          z.castShadow)
        ) {
          let D = z.shadow,
            C = t.get(z);
          (C.shadowIntensity = D.intensity),
            (C.shadowBias = D.bias),
            (C.shadowNormalBias = D.normalBias),
            (C.shadowRadius = D.radius),
            (C.shadowMapSize = D.mapSize),
            (C.shadowCameraNear = D.camera.near),
            (C.shadowCameraFar = D.camera.far),
            (n.pointShadow[d] = C),
            (n.pointShadowMap[d] = U),
            (n.pointShadowMatrix[d] = z.shadow.matrix),
            b++;
        }
        (n.point[d] = T), d++;
      } else if (z.isHemisphereLight) {
        let T = e.get(z);
        T.skyColor.copy(z.color).multiplyScalar(O),
          T.groundColor.copy(z.groundColor).multiplyScalar(O),
          (n.hemi[x] = T),
          x++;
      }
    }
    g > 0 &&
      (i.has("OES_texture_float_linear") === !0
        ? ((n.rectAreaLTC1 = st.LTC_FLOAT_1), (n.rectAreaLTC2 = st.LTC_FLOAT_2))
        : ((n.rectAreaLTC1 = st.LTC_HALF_1), (n.rectAreaLTC2 = st.LTC_HALF_2))),
      (n.ambient[0] = u),
      (n.ambient[1] = h),
      (n.ambient[2] = f);
    let E = n.hash;
    (E.directionalLength !== p ||
      E.pointLength !== d ||
      E.spotLength !== v ||
      E.rectAreaLength !== g ||
      E.hemiLength !== x ||
      E.numDirectionalShadows !== y ||
      E.numPointShadows !== b ||
      E.numSpotShadows !== m ||
      E.numSpotMaps !== A ||
      E.numLightProbes !== M) &&
      ((n.directional.length = p),
      (n.spot.length = v),
      (n.rectArea.length = g),
      (n.point.length = d),
      (n.hemi.length = x),
      (n.directionalShadow.length = y),
      (n.directionalShadowMap.length = y),
      (n.pointShadow.length = b),
      (n.pointShadowMap.length = b),
      (n.spotShadow.length = m),
      (n.spotShadowMap.length = m),
      (n.directionalShadowMatrix.length = y),
      (n.pointShadowMatrix.length = b),
      (n.spotLightMatrix.length = m + A - _),
      (n.spotLightMap.length = A),
      (n.numSpotLightShadowsWithMaps = _),
      (n.numLightProbes = M),
      (E.directionalLength = p),
      (E.pointLength = d),
      (E.spotLength = v),
      (E.rectAreaLength = g),
      (E.hemiLength = x),
      (E.numDirectionalShadows = y),
      (E.numPointShadows = b),
      (E.numSpotShadows = m),
      (E.numSpotMaps = A),
      (E.numLightProbes = M),
      (n.version = T6++));
  }
  function l(c, u) {
    let h = 0,
      f = 0,
      p = 0,
      d = 0,
      v = 0,
      g = u.matrixWorldInverse;
    for (let x = 0, y = c.length; x < y; x++) {
      let b = c[x];
      if (b.isDirectionalLight) {
        let m = n.directional[h];
        m.direction.setFromMatrixPosition(b.matrixWorld),
          s.setFromMatrixPosition(b.target.matrixWorld),
          m.direction.sub(s),
          m.direction.transformDirection(g),
          h++;
      } else if (b.isSpotLight) {
        let m = n.spot[p];
        m.position.setFromMatrixPosition(b.matrixWorld),
          m.position.applyMatrix4(g),
          m.direction.setFromMatrixPosition(b.matrixWorld),
          s.setFromMatrixPosition(b.target.matrixWorld),
          m.direction.sub(s),
          m.direction.transformDirection(g),
          p++;
      } else if (b.isRectAreaLight) {
        let m = n.rectArea[d];
        m.position.setFromMatrixPosition(b.matrixWorld),
          m.position.applyMatrix4(g),
          r.identity(),
          o.copy(b.matrixWorld),
          o.premultiply(g),
          r.extractRotation(o),
          m.halfWidth.set(b.width * 0.5, 0, 0),
          m.halfHeight.set(0, b.height * 0.5, 0),
          m.halfWidth.applyMatrix4(r),
          m.halfHeight.applyMatrix4(r),
          d++;
      } else if (b.isPointLight) {
        let m = n.point[f];
        m.position.setFromMatrixPosition(b.matrixWorld), m.position.applyMatrix4(g), f++;
      } else if (b.isHemisphereLight) {
        let m = n.hemi[v];
        m.direction.setFromMatrixPosition(b.matrixWorld), m.direction.transformDirection(g), v++;
      }
    }
  }
  return { setup: a, setupView: l, state: n };
}
function Sy(i) {
  let e = new R6(i),
    t = [],
    n = [];
  function s(u) {
    (c.camera = u), (t.length = 0), (n.length = 0);
  }
  function o(u) {
    t.push(u);
  }
  function r(u) {
    n.push(u);
  }
  function a() {
    e.setup(t);
  }
  function l(u) {
    e.setupView(t, u);
  }
  let c = {
    lightsArray: t,
    shadowsArray: n,
    camera: null,
    lights: e,
    transmissionRenderTarget: {},
  };
  return { init: s, state: c, setupLights: a, setupLightsView: l, pushLight: o, pushShadow: r };
}
function C6(i) {
  let e = new WeakMap();
  function t(s, o = 0) {
    let r = e.get(s),
      a;
    return (
      r === void 0
        ? ((a = new Sy(i)), e.set(s, [a]))
        : o >= r.length
          ? ((a = new Sy(i)), r.push(a))
          : (a = r[o]),
      a
    );
  }
  function n() {
    e = new WeakMap();
  }
  return { get: t, dispose: n };
}
var P6 = `void main() {
	gl_Position = vec4( position, 1.0 );
}`,
  I6 = `uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;
function z6(i, e, t) {
  let n = new Zr(),
    s = new Ae(),
    o = new Ae(),
    r = new Dt(),
    a = new cc({ depthPacking: ng }),
    l = new uc(),
    c = {},
    u = t.maxTextureSize,
    h = { [wr]: Ki, [Ki]: wr, [Sn]: Sn },
    f = new zn({
      defines: { VSM_SAMPLES: 8 },
      uniforms: {
        shadow_pass: { value: null },
        resolution: { value: new Ae() },
        radius: { value: 4 },
      },
      vertexShader: P6,
      fragmentShader: I6,
    }),
    p = f.clone();
  p.defines.HORIZONTAL_PASS = 1;
  let d = new nt();
  d.setAttribute("position", new et(new Float32Array([-1, -1, 0.5, 3, -1, 0.5, -1, 3, 0.5]), 3));
  let v = new Qe(d, f),
    g = this;
  (this.enabled = !1), (this.autoUpdate = !0), (this.needsUpdate = !1), (this.type = gc);
  let x = this.type;
  this.render = function (_, M, E) {
    if (g.enabled === !1 || (g.autoUpdate === !1 && g.needsUpdate === !1) || _.length === 0)
      return;
    let w = i.getRenderTarget(),
      S = i.getActiveCubeFace(),
      z = i.getActiveMipmapLevel(),
      H = i.state;
    H.setBlending(ko),
      H.buffers.depth.getReversed() === !0
        ? H.buffers.color.setClear(0, 0, 0, 0)
        : H.buffers.color.setClear(1, 1, 1, 1),
      H.buffers.depth.setTest(!0),
      H.setScissorTest(!1);
    let O = x !== ur && this.type === ur,
      q = x === ur && this.type !== ur;
    for (let U = 0, T = _.length; U < T; U++) {
      let D = _[U],
        C = D.shadow;
      if (C === void 0) {
        console.warn("THREE.WebGLShadowMap:", D, "has no shadow.");
        continue;
      }
      if (C.autoUpdate === !1 && C.needsUpdate === !1) continue;
      s.copy(C.mapSize);
      let G = C.getFrameExtents();
      if (
        (s.multiply(G),
        o.copy(C.mapSize),
        (s.x > u || s.y > u) &&
          (s.x > u && ((o.x = Math.floor(u / G.x)), (s.x = o.x * G.x), (C.mapSize.x = o.x)),
          s.y > u && ((o.y = Math.floor(u / G.y)), (s.y = o.y * G.y), (C.mapSize.y = o.y))),
        C.map === null || O === !0 || q === !0)
      ) {
        let N = this.type !== ur ? { minFilter: Gn, magFilter: Gn } : {};
        C.map !== null && C.map.dispose(),
          (C.map = new si(s.x, s.y, N)),
          (C.map.texture.name = D.name + ".shadowMap"),
          C.camera.updateProjectionMatrix();
      }
      i.setRenderTarget(C.map), i.clear();
      let j = C.getViewportCount();
      for (let N = 0; N < j; N++) {
        let Q = C.getViewport(N);
        r.set(o.x * Q.x, o.y * Q.y, o.x * Q.z, o.y * Q.w),
          H.viewport(r),
          C.updateMatrices(D, N),
          (n = C.getFrustum()),
          m(M, E, C.camera, D, this.type);
      }
      C.isPointLightShadow !== !0 && this.type === ur && y(C, E), (C.needsUpdate = !1);
    }
    (x = this.type), (g.needsUpdate = !1), i.setRenderTarget(w, S, z);
  };
  function y(_, M) {
    let E = e.update(v);
    f.defines.VSM_SAMPLES !== _.blurSamples &&
      ((f.defines.VSM_SAMPLES = _.blurSamples),
      (p.defines.VSM_SAMPLES = _.blurSamples),
      (f.needsUpdate = !0),
      (p.needsUpdate = !0)),
      _.mapPass === null && (_.mapPass = new si(s.x, s.y)),
      (f.uniforms.shadow_pass.value = _.map.texture),
      (f.uniforms.resolution.value = _.mapSize),
      (f.uniforms.radius.value = _.radius),
      i.setRenderTarget(_.mapPass),
      i.clear(),
      i.renderBufferDirect(M, null, E, f, v, null),
      (p.uniforms.shadow_pass.value = _.mapPass.texture),
      (p.uniforms.resolution.value = _.mapSize),
      (p.uniforms.radius.value = _.radius),
      i.setRenderTarget(_.map),
      i.clear(),
      i.renderBufferDirect(M, null, E, p, v, null);
  }
  function b(_, M, E, w) {
    let S = null,
      z = E.isPointLight === !0 ? _.customDistanceMaterial : _.customDepthMaterial;
    if (z !== void 0) S = z;
    else if (
      ((S = E.isPointLight === !0 ? l : a),
      (i.localClippingEnabled &&
        M.clipShadows === !0 &&
        Array.isArray(M.clippingPlanes) &&
        M.clippingPlanes.length !== 0) ||
        (M.displacementMap && M.displacementScale !== 0) ||
        (M.alphaMap && M.alphaTest > 0) ||
        (M.map && M.alphaTest > 0) ||
        M.alphaToCoverage === !0)
    ) {
      let H = S.uuid,
        O = M.uuid,
        q = c[H];
      q === void 0 && ((q = {}), (c[H] = q));
      let U = q[O];
      U === void 0 && ((U = S.clone()), (q[O] = U), M.addEventListener("dispose", A)), (S = U);
    }
    if (
      ((S.visible = M.visible),
      (S.wireframe = M.wireframe),
      w === ur
        ? (S.side = M.shadowSide !== null ? M.shadowSide : M.side)
        : (S.side = M.shadowSide !== null ? M.shadowSide : h[M.side]),
      (S.alphaMap = M.alphaMap),
      (S.alphaTest = M.alphaToCoverage === !0 ? 0.5 : M.alphaTest),
      (S.map = M.map),
      (S.clipShadows = M.clipShadows),
      (S.clippingPlanes = M.clippingPlanes),
      (S.clipIntersection = M.clipIntersection),
      (S.displacementMap = M.displacementMap),
      (S.displacementScale = M.displacementScale),
      (S.displacementBias = M.displacementBias),
      (S.wireframeLinewidth = M.wireframeLinewidth),
      (S.linewidth = M.linewidth),
      E.isPointLight === !0 && S.isMeshDistanceMaterial === !0)
    ) {
      let H = i.properties.get(S);
      H.light = E;
    }
    return S;
  }
  function m(_, M, E, w, S) {
    if (_.visible === !1) return;
    if (
      _.layers.test(M.layers) &&
      (_.isMesh || _.isLine || _.isPoints) &&
      (_.castShadow || (_.receiveShadow && S === ur)) &&
      (!_.frustumCulled || n.intersectsObject(_))
    ) {
      _.modelViewMatrix.multiplyMatrices(E.matrixWorldInverse, _.matrixWorld);
      let O = e.update(_),
        q = _.material;
      if (Array.isArray(q)) {
        let U = O.groups;
        for (let T = 0, D = U.length; T < D; T++) {
          let C = U[T],
            G = q[C.materialIndex];
          if (G && G.visible) {
            let j = b(_, G, w, S);
            _.onBeforeShadow(i, _, M, E, O, j, C),
              i.renderBufferDirect(E, null, O, j, _, C),
              _.onAfterShadow(i, _, M, E, O, j, C);
          }
        }
      } else if (q.visible) {
        let U = b(_, q, w, S);
        _.onBeforeShadow(i, _, M, E, O, U, null),
          i.renderBufferDirect(E, null, O, U, _, null),
          _.onAfterShadow(i, _, M, E, O, U, null);
      }
    }
    let H = _.children;
    for (let O = 0, q = H.length; O < q; O++) m(H[O], M, E, w, S);
  }
  function A(_) {
    _.target.removeEventListener("dispose", A);
    for (let E in c) {
      let w = c[E],
        S = _.target.uuid;
      S in w && (w[S].dispose(), delete w[S]);
    }
  }
}
var D6 = { [Ah]: q0, [Rh]: Ih, [Ch]: zh, [za]: Ph, [q0]: Ah, [Ih]: Rh, [zh]: Ch, [Ph]: za };
function L6(i, e) {
  function t() {
    let xe = !1,
      Ie = new Dt(),
      Be = null,
      Xe = new Dt(0, 0, 0, 0);
    return {
      setMask: function (Me) {
        Be !== Me && !xe && (i.colorMask(Me, Me, Me, Me), (Be = Me));
      },
      setLocked: function (Me) {
        xe = Me;
      },
      setClear: function (Me, we, be, Oe, pt) {
        pt === !0 && ((Me *= Oe), (we *= Oe), (be *= Oe)),
          Ie.set(Me, we, be, Oe),
          Xe.equals(Ie) === !1 && (i.clearColor(Me, we, be, Oe), Xe.copy(Ie));
      },
      reset: function () {
        (xe = !1), (Be = null), Xe.set(-1, 0, 0, 0);
      },
    };
  }
  function n() {
    let xe = !1,
      Ie = !1,
      Be = null,
      Xe = null,
      Me = null;
    return {
      setReversed: function (we) {
        if (Ie !== we) {
          let be = e.get("EXT_clip_control");
          we
            ? be.clipControlEXT(be.LOWER_LEFT_EXT, be.ZERO_TO_ONE_EXT)
            : be.clipControlEXT(be.LOWER_LEFT_EXT, be.NEGATIVE_ONE_TO_ONE_EXT),
            (Ie = we);
          let Oe = Me;
          (Me = null), this.setClear(Oe);
        }
      },
      getReversed: function () {
        return Ie;
      },
      setTest: function (we) {
        we ? ne(i.DEPTH_TEST) : re(i.DEPTH_TEST);
      },
      setMask: function (we) {
        Be !== we && !xe && (i.depthMask(we), (Be = we));
      },
      setFunc: function (we) {
        if ((Ie && (we = D6[we]), Xe !== we)) {
          switch (we) {
            case Ah:
              i.depthFunc(i.NEVER);
              break;
            case q0:
              i.depthFunc(i.ALWAYS);
              break;
            case Rh:
              i.depthFunc(i.LESS);
              break;
            case za:
              i.depthFunc(i.LEQUAL);
              break;
            case Ch:
              i.depthFunc(i.EQUAL);
              break;
            case Ph:
              i.depthFunc(i.GEQUAL);
              break;
            case Ih:
              i.depthFunc(i.GREATER);
              break;
            case zh:
              i.depthFunc(i.NOTEQUAL);
              break;
            default:
              i.depthFunc(i.LEQUAL);
          }
          Xe = we;
        }
      },
      setLocked: function (we) {
        xe = we;
      },
      setClear: function (we) {
        Me !== we && (Ie && (we = 1 - we), i.clearDepth(we), (Me = we));
      },
      reset: function () {
        (xe = !1), (Be = null), (Xe = null), (Me = null), (Ie = !1);
      },
    };
  }
  function s() {
    let xe = !1,
      Ie = null,
      Be = null,
      Xe = null,
      Me = null,
      we = null,
      be = null,
      Oe = null,
      pt = null;
    return {
      setTest: function (ut) {
        xe || (ut ? ne(i.STENCIL_TEST) : re(i.STENCIL_TEST));
      },
      setMask: function (ut) {
        Ie !== ut && !xe && (i.stencilMask(ut), (Ie = ut));
      },
      setFunc: function (ut, nn, bt) {
        (Be !== ut || Xe !== nn || Me !== bt) &&
          (i.stencilFunc(ut, nn, bt), (Be = ut), (Xe = nn), (Me = bt));
      },
      setOp: function (ut, nn, bt) {
        (we !== ut || be !== nn || Oe !== bt) &&
          (i.stencilOp(ut, nn, bt), (we = ut), (be = nn), (Oe = bt));
      },
      setLocked: function (ut) {
        xe = ut;
      },
      setClear: function (ut) {
        pt !== ut && (i.clearStencil(ut), (pt = ut));
      },
      reset: function () {
        (xe = !1),
          (Ie = null),
          (Be = null),
          (Xe = null),
          (Me = null),
          (we = null),
          (be = null),
          (Oe = null),
          (pt = null);
      },
    };
  }
  let o = new t(),
    r = new n(),
    a = new s(),
    l = new WeakMap(),
    c = new WeakMap(),
    u = {},
    h = {},
    f = new WeakMap(),
    p = [],
    d = null,
    v = !1,
    g = null,
    x = null,
    y = null,
    b = null,
    m = null,
    A = null,
    _ = null,
    M = new Ve(0, 0, 0),
    E = 0,
    w = !1,
    S = null,
    z = null,
    H = null,
    O = null,
    q = null,
    U = i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
    T = !1,
    D = 0,
    C = i.getParameter(i.VERSION);
  C.indexOf("WebGL") !== -1
    ? ((D = parseFloat(/^WebGL (\d)/.exec(C)[1])), (T = D >= 1))
    : C.indexOf("OpenGL ES") !== -1 &&
      ((D = parseFloat(/^OpenGL ES (\d)/.exec(C)[1])), (T = D >= 2));
  let G = null,
    j = {},
    N = i.getParameter(i.SCISSOR_BOX),
    Q = i.getParameter(i.VIEWPORT),
    K = new Dt().fromArray(N),
    ie = new Dt().fromArray(Q);
  function F(xe, Ie, Be, Xe) {
    let Me = new Uint8Array(4),
      we = i.createTexture();
    i.bindTexture(xe, we),
      i.texParameteri(xe, i.TEXTURE_MIN_FILTER, i.NEAREST),
      i.texParameteri(xe, i.TEXTURE_MAG_FILTER, i.NEAREST);
    for (let be = 0; be < Be; be++)
      xe === i.TEXTURE_3D || xe === i.TEXTURE_2D_ARRAY
        ? i.texImage3D(Ie, 0, i.RGBA, 1, 1, Xe, 0, i.RGBA, i.UNSIGNED_BYTE, Me)
        : i.texImage2D(Ie + be, 0, i.RGBA, 1, 1, 0, i.RGBA, i.UNSIGNED_BYTE, Me);
    return we;
  }
  let X = {};
  (X[i.TEXTURE_2D] = F(i.TEXTURE_2D, i.TEXTURE_2D, 1)),
    (X[i.TEXTURE_CUBE_MAP] = F(i.TEXTURE_CUBE_MAP, i.TEXTURE_CUBE_MAP_POSITIVE_X, 6)),
    (X[i.TEXTURE_2D_ARRAY] = F(i.TEXTURE_2D_ARRAY, i.TEXTURE_2D_ARRAY, 1, 1)),
    (X[i.TEXTURE_3D] = F(i.TEXTURE_3D, i.TEXTURE_3D, 1, 1)),
    o.setClear(0, 0, 0, 1),
    r.setClear(1),
    a.setClear(0),
    ne(i.DEPTH_TEST),
    r.setFunc(za),
    Y(!1),
    L(Np),
    ne(i.CULL_FACE),
    P(ko);
  function ne(xe) {
    u[xe] !== !0 && (i.enable(xe), (u[xe] = !0));
  }
  function re(xe) {
    u[xe] !== !1 && (i.disable(xe), (u[xe] = !1));
  }
  function $(xe, Ie) {
    return h[xe] !== Ie
      ? (i.bindFramebuffer(xe, Ie),
        (h[xe] = Ie),
        xe === i.DRAW_FRAMEBUFFER && (h[i.FRAMEBUFFER] = Ie),
        xe === i.FRAMEBUFFER && (h[i.DRAW_FRAMEBUFFER] = Ie),
        !0)
      : !1;
  }
  function ue(xe, Ie) {
    let Be = p,
      Xe = !1;
    if (xe) {
      (Be = f.get(Ie)), Be === void 0 && ((Be = []), f.set(Ie, Be));
      let Me = xe.textures;
      if (Be.length !== Me.length || Be[0] !== i.COLOR_ATTACHMENT0) {
        for (let we = 0, be = Me.length; we < be; we++) Be[we] = i.COLOR_ATTACHMENT0 + we;
        (Be.length = Me.length), (Xe = !0);
      }
    } else Be[0] !== i.BACK && ((Be[0] = i.BACK), (Xe = !0));
    Xe && i.drawBuffers(Be);
  }
  function me(xe) {
    return d !== xe ? (i.useProgram(xe), (d = xe), !0) : !1;
  }
  let ee = { [nr]: i.FUNC_ADD, [S2]: i.FUNC_SUBTRACT, [T2]: i.FUNC_REVERSE_SUBTRACT };
  (ee[A2] = i.MIN), (ee[R2] = i.MAX);
  let B = {
    [Th]: i.ZERO,
    [G0]: i.ONE,
    [C2]: i.SRC_COLOR,
    [Au]: i.SRC_ALPHA,
    [k2]: i.SRC_ALPHA_SATURATE,
    [D2]: i.DST_COLOR,
    [I2]: i.DST_ALPHA,
    [P2]: i.ONE_MINUS_SRC_COLOR,
    [w0]: i.ONE_MINUS_SRC_ALPHA,
    [L2]: i.ONE_MINUS_DST_COLOR,
    [z2]: i.ONE_MINUS_DST_ALPHA,
    [F2]: i.CONSTANT_COLOR,
    [U2]: i.ONE_MINUS_CONSTANT_COLOR,
    [N2]: i.CONSTANT_ALPHA,
    [B2]: i.ONE_MINUS_CONSTANT_ALPHA,
  };
  function P(xe, Ie, Be, Xe, Me, we, be, Oe, pt, ut) {
    if (xe === ko) {
      v === !0 && (re(i.BLEND), (v = !1));
      return;
    }
    if ((v === !1 && (ne(i.BLEND), (v = !0)), xe !== Sh)) {
      if (xe !== g || ut !== w) {
        if (((x !== nr || m !== nr) && (i.blendEquation(i.FUNC_ADD), (x = nr), (m = nr)), ut))
          switch (xe) {
            case Ia:
              i.blendFuncSeparate(i.ONE, i.ONE_MINUS_SRC_ALPHA, i.ONE, i.ONE_MINUS_SRC_ALPHA);
              break;
            case hr:
              i.blendFunc(i.ONE, i.ONE);
              break;
            case Bp:
              i.blendFuncSeparate(i.ZERO, i.ONE_MINUS_SRC_COLOR, i.ZERO, i.ONE);
              break;
            case Op:
              i.blendFuncSeparate(i.DST_COLOR, i.ONE_MINUS_SRC_ALPHA, i.ZERO, i.ONE);
              break;
            default:
              console.error("THREE.WebGLState: Invalid blending: ", xe);
              break;
          }
        else
          switch (xe) {
            case Ia:
              i.blendFuncSeparate(
                i.SRC_ALPHA,
                i.ONE_MINUS_SRC_ALPHA,
                i.ONE,
                i.ONE_MINUS_SRC_ALPHA,
              );
              break;
            case hr:
              i.blendFuncSeparate(i.SRC_ALPHA, i.ONE, i.ONE, i.ONE);
              break;
            case Bp:
              console.error(
                "THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true",
              );
              break;
            case Op:
              console.error(
                "THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true",
              );
              break;
            default:
              console.error("THREE.WebGLState: Invalid blending: ", xe);
              break;
          }
        (y = null),
          (b = null),
          (A = null),
          (_ = null),
          M.set(0, 0, 0),
          (E = 0),
          (g = xe),
          (w = ut);
      }
      return;
    }
    (Me = Me || Ie),
      (we = we || Be),
      (be = be || Xe),
      (Ie !== x || Me !== m) && (i.blendEquationSeparate(ee[Ie], ee[Me]), (x = Ie), (m = Me)),
      (Be !== y || Xe !== b || we !== A || be !== _) &&
        (i.blendFuncSeparate(B[Be], B[Xe], B[we], B[be]), (y = Be), (b = Xe), (A = we), (_ = be)),
      (Oe.equals(M) === !1 || pt !== E) &&
        (i.blendColor(Oe.r, Oe.g, Oe.b, pt), M.copy(Oe), (E = pt)),
      (g = xe),
      (w = !1);
  }
  function V(xe, Ie) {
    xe.side === Sn ? re(i.CULL_FACE) : ne(i.CULL_FACE);
    let Be = xe.side === Ki;
    Ie && (Be = !Be),
      Y(Be),
      xe.blending === Ia && xe.transparent === !1
        ? P(ko)
        : P(
            xe.blending,
            xe.blendEquation,
            xe.blendSrc,
            xe.blendDst,
            xe.blendEquationAlpha,
            xe.blendSrcAlpha,
            xe.blendDstAlpha,
            xe.blendColor,
            xe.blendAlpha,
            xe.premultipliedAlpha,
          ),
      r.setFunc(xe.depthFunc),
      r.setTest(xe.depthTest),
      r.setMask(xe.depthWrite),
      o.setMask(xe.colorWrite);
    let Xe = xe.stencilWrite;
    a.setTest(Xe),
      Xe &&
        (a.setMask(xe.stencilWriteMask),
        a.setFunc(xe.stencilFunc, xe.stencilRef, xe.stencilFuncMask),
        a.setOp(xe.stencilFail, xe.stencilZFail, xe.stencilZPass)),
      J(xe.polygonOffset, xe.polygonOffsetFactor, xe.polygonOffsetUnits),
      xe.alphaToCoverage === !0 ? ne(i.SAMPLE_ALPHA_TO_COVERAGE) : re(i.SAMPLE_ALPHA_TO_COVERAGE);
  }
  function Y(xe) {
    S !== xe && (xe ? i.frontFace(i.CW) : i.frontFace(i.CCW), (S = xe));
  }
  function L(xe) {
    xe !== w2
      ? (ne(i.CULL_FACE),
        xe !== z &&
          (xe === Np
            ? i.cullFace(i.BACK)
            : xe === E2
              ? i.cullFace(i.FRONT)
              : i.cullFace(i.FRONT_AND_BACK)))
      : re(i.CULL_FACE),
      (z = xe);
  }
  function Z(xe) {
    xe !== H && (T && i.lineWidth(xe), (H = xe));
  }
  function J(xe, Ie, Be) {
    xe
      ? (ne(i.POLYGON_OFFSET_FILL),
        (O !== Ie || q !== Be) && (i.polygonOffset(Ie, Be), (O = Ie), (q = Be)))
      : re(i.POLYGON_OFFSET_FILL);
  }
  function oe(xe) {
    xe ? ne(i.SCISSOR_TEST) : re(i.SCISSOR_TEST);
  }
  function fe(xe) {
    xe === void 0 && (xe = i.TEXTURE0 + U - 1), G !== xe && (i.activeTexture(xe), (G = xe));
  }
  function le(xe, Ie, Be) {
    Be === void 0 && (G === null ? (Be = i.TEXTURE0 + U - 1) : (Be = G));
    let Xe = j[Be];
    Xe === void 0 && ((Xe = { type: void 0, texture: void 0 }), (j[Be] = Xe)),
      (Xe.type !== xe || Xe.texture !== Ie) &&
        (G !== Be && (i.activeTexture(Be), (G = Be)),
        i.bindTexture(xe, Ie || X[xe]),
        (Xe.type = xe),
        (Xe.texture = Ie));
  }
  function R() {
    let xe = j[G];
    xe !== void 0 &&
      xe.type !== void 0 &&
      (i.bindTexture(xe.type, null), (xe.type = void 0), (xe.texture = void 0));
  }
  function I() {
    try {
      i.compressedTexImage2D(...arguments);
    } catch (xe) {
      console.error("THREE.WebGLState:", xe);
    }
  }
  function se() {
    try {
      i.compressedTexImage3D(...arguments);
    } catch (xe) {
      console.error("THREE.WebGLState:", xe);
    }
  }
  function ae() {
    try {
      i.texSubImage2D(...arguments);
    } catch (xe) {
      console.error("THREE.WebGLState:", xe);
    }
  }
  function k() {
    try {
      i.texSubImage3D(...arguments);
    } catch (xe) {
      console.error("THREE.WebGLState:", xe);
    }
  }
  function ce() {
    try {
      i.compressedTexSubImage2D(...arguments);
    } catch (xe) {
      console.error("THREE.WebGLState:", xe);
    }
  }
  function ve() {
    try {
      i.compressedTexSubImage3D(...arguments);
    } catch (xe) {
      console.error("THREE.WebGLState:", xe);
    }
  }
  function _e() {
    try {
      i.texStorage2D(...arguments);
    } catch (xe) {
      console.error("THREE.WebGLState:", xe);
    }
  }
  function Te() {
    try {
      i.texStorage3D(...arguments);
    } catch (xe) {
      console.error("THREE.WebGLState:", xe);
    }
  }
  function Pe() {
    try {
      i.texImage2D(...arguments);
    } catch (xe) {
      console.error("THREE.WebGLState:", xe);
    }
  }
  function Re() {
    try {
      i.texImage3D(...arguments);
    } catch (xe) {
      console.error("THREE.WebGLState:", xe);
    }
  }
  function Fe(xe) {
    K.equals(xe) === !1 && (i.scissor(xe.x, xe.y, xe.z, xe.w), K.copy(xe));
  }
  function ze(xe) {
    ie.equals(xe) === !1 && (i.viewport(xe.x, xe.y, xe.z, xe.w), ie.copy(xe));
  }
  function We(xe, Ie) {
    let Be = c.get(Ie);
    Be === void 0 && ((Be = new WeakMap()), c.set(Ie, Be));
    let Xe = Be.get(xe);
    Xe === void 0 && ((Xe = i.getUniformBlockIndex(Ie, xe.name)), Be.set(xe, Xe));
  }
  function Ne(xe, Ie) {
    let Xe = c.get(Ie).get(xe);
    l.get(Ie) !== Xe && (i.uniformBlockBinding(Ie, Xe, xe.__bindingPointIndex), l.set(Ie, Xe));
  }
  function dt() {
    i.disable(i.BLEND),
      i.disable(i.CULL_FACE),
      i.disable(i.DEPTH_TEST),
      i.disable(i.POLYGON_OFFSET_FILL),
      i.disable(i.SCISSOR_TEST),
      i.disable(i.STENCIL_TEST),
      i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),
      i.blendEquation(i.FUNC_ADD),
      i.blendFunc(i.ONE, i.ZERO),
      i.blendFuncSeparate(i.ONE, i.ZERO, i.ONE, i.ZERO),
      i.blendColor(0, 0, 0, 0),
      i.colorMask(!0, !0, !0, !0),
      i.clearColor(0, 0, 0, 0),
      i.depthMask(!0),
      i.depthFunc(i.LESS),
      r.setReversed(!1),
      i.clearDepth(1),
      i.stencilMask(4294967295),
      i.stencilFunc(i.ALWAYS, 0, 4294967295),
      i.stencilOp(i.KEEP, i.KEEP, i.KEEP),
      i.clearStencil(0),
      i.cullFace(i.BACK),
      i.frontFace(i.CCW),
      i.polygonOffset(0, 0),
      i.activeTexture(i.TEXTURE0),
      i.bindFramebuffer(i.FRAMEBUFFER, null),
      i.bindFramebuffer(i.DRAW_FRAMEBUFFER, null),
      i.bindFramebuffer(i.READ_FRAMEBUFFER, null),
      i.useProgram(null),
      i.lineWidth(1),
      i.scissor(0, 0, i.canvas.width, i.canvas.height),
      i.viewport(0, 0, i.canvas.width, i.canvas.height),
      (u = {}),
      (G = null),
      (j = {}),
      (h = {}),
      (f = new WeakMap()),
      (p = []),
      (d = null),
      (v = !1),
      (g = null),
      (x = null),
      (y = null),
      (b = null),
      (m = null),
      (A = null),
      (_ = null),
      (M = new Ve(0, 0, 0)),
      (E = 0),
      (w = !1),
      (S = null),
      (z = null),
      (H = null),
      (O = null),
      (q = null),
      K.set(0, 0, i.canvas.width, i.canvas.height),
      ie.set(0, 0, i.canvas.width, i.canvas.height),
      o.reset(),
      r.reset(),
      a.reset();
  }
  return {
    buffers: { color: o, depth: r, stencil: a },
    enable: ne,
    disable: re,
    bindFramebuffer: $,
    drawBuffers: ue,
    useProgram: me,
    setBlending: P,
    setMaterial: V,
    setFlipSided: Y,
    setCullFace: L,
    setLineWidth: Z,
    setPolygonOffset: J,
    setScissorTest: oe,
    activeTexture: fe,
    bindTexture: le,
    unbindTexture: R,
    compressedTexImage2D: I,
    compressedTexImage3D: se,
    texImage2D: Pe,
    texImage3D: Re,
    updateUBOMapping: We,
    uniformBlockBinding: Ne,
    texStorage2D: _e,
    texStorage3D: Te,
    texSubImage2D: ae,
    texSubImage3D: k,
    compressedTexSubImage2D: ce,
    compressedTexSubImage3D: ve,
    scissor: Fe,
    viewport: ze,
    reset: dt,
  };
}
function k6(i, e, t, n, s, o, r) {
  let a = e.has("WEBGL_multisampled_render_to_texture")
      ? e.get("WEBGL_multisampled_render_to_texture")
      : null,
    l = typeof navigator > "u" ? !1 : /OculusBrowser/g.test(navigator.userAgent),
    c = new Ae(),
    u = new WeakMap(),
    h,
    f = new WeakMap(),
    p = !1;
  try {
    p = typeof OffscreenCanvas < "u" && new OffscreenCanvas(1, 1).getContext("2d") !== null;
  } catch {}
  function d(R, I) {
    return p ? new OffscreenCanvas(R, I) : Zl("canvas");
  }
  function v(R, I, se) {
    let ae = 1,
      k = le(R);
    if (((k.width > se || k.height > se) && (ae = se / Math.max(k.width, k.height)), ae < 1))
      if (
        (typeof HTMLImageElement < "u" && R instanceof HTMLImageElement) ||
        (typeof HTMLCanvasElement < "u" && R instanceof HTMLCanvasElement) ||
        (typeof ImageBitmap < "u" && R instanceof ImageBitmap) ||
        (typeof VideoFrame < "u" && R instanceof VideoFrame)
      ) {
        let ce = Math.floor(ae * k.width),
          ve = Math.floor(ae * k.height);
        h === void 0 && (h = d(ce, ve));
        let _e = I ? d(ce, ve) : h;
        return (
          (_e.width = ce),
          (_e.height = ve),
          _e.getContext("2d").drawImage(R, 0, 0, ce, ve),
          console.warn(
            "THREE.WebGLRenderer: Texture has been resized from (" +
              k.width +
              "x" +
              k.height +
              ") to (" +
              ce +
              "x" +
              ve +
              ").",
          ),
          _e
        );
      } else
        return (
          "data" in R &&
            console.warn(
              "THREE.WebGLRenderer: Image in DataTexture is too big (" +
                k.width +
                "x" +
                k.height +
                ").",
            ),
          R
        );
    return R;
  }
  function g(R) {
    return R.generateMipmaps;
  }
  function x(R) {
    i.generateMipmap(R);
  }
  function y(R) {
    return R.isWebGLCubeRenderTarget
      ? i.TEXTURE_CUBE_MAP
      : R.isWebGL3DRenderTarget
        ? i.TEXTURE_3D
        : R.isWebGLArrayRenderTarget || R.isCompressedArrayTexture
          ? i.TEXTURE_2D_ARRAY
          : i.TEXTURE_2D;
  }
  function b(R, I, se, ae, k = !1) {
    if (R !== null) {
      if (i[R] !== void 0) return i[R];
      console.warn(
        "THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '" + R + "'",
      );
    }
    let ce = I;
    if (
      (I === i.RED &&
        (se === i.FLOAT && (ce = i.R32F),
        se === i.HALF_FLOAT && (ce = i.R16F),
        se === i.UNSIGNED_BYTE && (ce = i.R8)),
      I === i.RED_INTEGER &&
        (se === i.UNSIGNED_BYTE && (ce = i.R8UI),
        se === i.UNSIGNED_SHORT && (ce = i.R16UI),
        se === i.UNSIGNED_INT && (ce = i.R32UI),
        se === i.BYTE && (ce = i.R8I),
        se === i.SHORT && (ce = i.R16I),
        se === i.INT && (ce = i.R32I)),
      I === i.RG &&
        (se === i.FLOAT && (ce = i.RG32F),
        se === i.HALF_FLOAT && (ce = i.RG16F),
        se === i.UNSIGNED_BYTE && (ce = i.RG8)),
      I === i.RG_INTEGER &&
        (se === i.UNSIGNED_BYTE && (ce = i.RG8UI),
        se === i.UNSIGNED_SHORT && (ce = i.RG16UI),
        se === i.UNSIGNED_INT && (ce = i.RG32UI),
        se === i.BYTE && (ce = i.RG8I),
        se === i.SHORT && (ce = i.RG16I),
        se === i.INT && (ce = i.RG32I)),
      I === i.RGB_INTEGER &&
        (se === i.UNSIGNED_BYTE && (ce = i.RGB8UI),
        se === i.UNSIGNED_SHORT && (ce = i.RGB16UI),
        se === i.UNSIGNED_INT && (ce = i.RGB32UI),
        se === i.BYTE && (ce = i.RGB8I),
        se === i.SHORT && (ce = i.RGB16I),
        se === i.INT && (ce = i.RGB32I)),
      I === i.RGBA_INTEGER &&
        (se === i.UNSIGNED_BYTE && (ce = i.RGBA8UI),
        se === i.UNSIGNED_SHORT && (ce = i.RGBA16UI),
        se === i.UNSIGNED_INT && (ce = i.RGBA32UI),
        se === i.BYTE && (ce = i.RGBA8I),
        se === i.SHORT && (ce = i.RGBA16I),
        se === i.INT && (ce = i.RGBA32I)),
      I === i.RGB &&
        (se === i.UNSIGNED_INT_5_9_9_9_REV && (ce = i.RGB9_E5),
        se === i.UNSIGNED_INT_10F_11F_11F_REV && (ce = i.R11F_G11F_B10F)),
      I === i.RGBA)
    ) {
      let ve = k ? Yl : Kt.getTransfer(ae);
      se === i.FLOAT && (ce = i.RGBA32F),
        se === i.HALF_FLOAT && (ce = i.RGBA16F),
        se === i.UNSIGNED_BYTE && (ce = ve === bn ? i.SRGB8_ALPHA8 : i.RGBA8),
        se === i.UNSIGNED_SHORT_4_4_4_4 && (ce = i.RGBA4),
        se === i.UNSIGNED_SHORT_5_5_5_1 && (ce = i.RGB5_A1);
    }
    return (
      (ce === i.R16F ||
        ce === i.R32F ||
        ce === i.RG16F ||
        ce === i.RG32F ||
        ce === i.RGBA16F ||
        ce === i.RGBA32F) &&
        e.get("EXT_color_buffer_float"),
      ce
    );
  }
  function m(R, I) {
    let se;
    return (
      R
        ? I === null || I === Zs || I === Z0
          ? (se = i.DEPTH24_STENCIL8)
          : I === as
            ? (se = i.DEPTH32F_STENCIL8)
            : I === $0 &&
              ((se = i.DEPTH24_STENCIL8),
              console.warn(
                "DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.",
              ))
        : I === null || I === Zs || I === Z0
          ? (se = i.DEPTH_COMPONENT24)
          : I === as
            ? (se = i.DEPTH_COMPONENT32F)
            : I === $0 && (se = i.DEPTH_COMPONENT16),
      se
    );
  }
  function A(R, I) {
    return g(R) === !0 || (R.isFramebufferTexture && R.minFilter !== Gn && R.minFilter !== Zt)
      ? Math.log2(Math.max(I.width, I.height)) + 1
      : R.mipmaps !== void 0 && R.mipmaps.length > 0
        ? R.mipmaps.length
        : R.isCompressedTexture && Array.isArray(R.image)
          ? I.mipmaps.length
          : 1;
  }
  function _(R) {
    let I = R.target;
    I.removeEventListener("dispose", _), E(I), I.isVideoTexture && u.delete(I);
  }
  function M(R) {
    let I = R.target;
    I.removeEventListener("dispose", M), S(I);
  }
  function E(R) {
    let I = n.get(R);
    if (I.__webglInit === void 0) return;
    let se = R.source,
      ae = f.get(se);
    if (ae) {
      let k = ae[I.__cacheKey];
      k.usedTimes--, k.usedTimes === 0 && w(R), Object.keys(ae).length === 0 && f.delete(se);
    }
    n.remove(R);
  }
  function w(R) {
    let I = n.get(R);
    i.deleteTexture(I.__webglTexture);
    let se = R.source,
      ae = f.get(se);
    delete ae[I.__cacheKey], r.memory.textures--;
  }
  function S(R) {
    let I = n.get(R);
    if (
      (R.depthTexture && (R.depthTexture.dispose(), n.remove(R.depthTexture)),
      R.isWebGLCubeRenderTarget)
    )
      for (let ae = 0; ae < 6; ae++) {
        if (Array.isArray(I.__webglFramebuffer[ae]))
          for (let k = 0; k < I.__webglFramebuffer[ae].length; k++)
            i.deleteFramebuffer(I.__webglFramebuffer[ae][k]);
        else i.deleteFramebuffer(I.__webglFramebuffer[ae]);
        I.__webglDepthbuffer && i.deleteRenderbuffer(I.__webglDepthbuffer[ae]);
      }
    else {
      if (Array.isArray(I.__webglFramebuffer))
        for (let ae = 0; ae < I.__webglFramebuffer.length; ae++)
          i.deleteFramebuffer(I.__webglFramebuffer[ae]);
      else i.deleteFramebuffer(I.__webglFramebuffer);
      if (
        (I.__webglDepthbuffer && i.deleteRenderbuffer(I.__webglDepthbuffer),
        I.__webglMultisampledFramebuffer && i.deleteFramebuffer(I.__webglMultisampledFramebuffer),
        I.__webglColorRenderbuffer)
      )
        for (let ae = 0; ae < I.__webglColorRenderbuffer.length; ae++)
          I.__webglColorRenderbuffer[ae] && i.deleteRenderbuffer(I.__webglColorRenderbuffer[ae]);
      I.__webglDepthRenderbuffer && i.deleteRenderbuffer(I.__webglDepthRenderbuffer);
    }
    let se = R.textures;
    for (let ae = 0, k = se.length; ae < k; ae++) {
      let ce = n.get(se[ae]);
      ce.__webglTexture && (i.deleteTexture(ce.__webglTexture), r.memory.textures--),
        n.remove(se[ae]);
    }
    n.remove(R);
  }
  let z = 0;
  function H() {
    z = 0;
  }
  function O() {
    let R = z;
    return (
      R >= s.maxTextures &&
        console.warn(
          "THREE.WebGLTextures: Trying to use " +
            R +
            " texture units while this GPU supports only " +
            s.maxTextures,
        ),
      (z += 1),
      R
    );
  }
  function q(R) {
    let I = [];
    return (
      I.push(R.wrapS),
      I.push(R.wrapT),
      I.push(R.wrapR || 0),
      I.push(R.magFilter),
      I.push(R.minFilter),
      I.push(R.anisotropy),
      I.push(R.internalFormat),
      I.push(R.format),
      I.push(R.type),
      I.push(R.generateMipmaps),
      I.push(R.premultiplyAlpha),
      I.push(R.flipY),
      I.push(R.unpackAlignment),
      I.push(R.colorSpace),
      I.join()
    );
  }
  function U(R, I) {
    let se = n.get(R);
    if (
      (R.isVideoTexture && oe(R),
      R.isRenderTargetTexture === !1 &&
        R.isExternalTexture !== !0 &&
        R.version > 0 &&
        se.__version !== R.version)
    ) {
      let ae = R.image;
      if (ae === null)
        console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");
      else if (ae.complete === !1)
        console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");
      else {
        X(se, R, I);
        return;
      }
    } else R.isExternalTexture && (se.__webglTexture = R.sourceTexture ? R.sourceTexture : null);
    t.bindTexture(i.TEXTURE_2D, se.__webglTexture, i.TEXTURE0 + I);
  }
  function T(R, I) {
    let se = n.get(R);
    if (R.isRenderTargetTexture === !1 && R.version > 0 && se.__version !== R.version) {
      X(se, R, I);
      return;
    }
    t.bindTexture(i.TEXTURE_2D_ARRAY, se.__webglTexture, i.TEXTURE0 + I);
  }
  function D(R, I) {
    let se = n.get(R);
    if (R.isRenderTargetTexture === !1 && R.version > 0 && se.__version !== R.version) {
      X(se, R, I);
      return;
    }
    t.bindTexture(i.TEXTURE_3D, se.__webglTexture, i.TEXTURE0 + I);
  }
  function C(R, I) {
    let se = n.get(R);
    if (R.version > 0 && se.__version !== R.version) {
      ne(se, R, I);
      return;
    }
    t.bindTexture(i.TEXTURE_CUBE_MAP, se.__webglTexture, i.TEXTURE0 + I);
  }
  let G = { [Is]: i.REPEAT, [Bi]: i.CLAMP_TO_EDGE, [Gl]: i.MIRRORED_REPEAT },
    j = {
      [Gn]: i.NEAREST,
      [Hp]: i.NEAREST_MIPMAP_NEAREST,
      [Y0]: i.NEAREST_MIPMAP_LINEAR,
      [Zt]: i.LINEAR,
      [_c]: i.LINEAR_MIPMAP_NEAREST,
      [Ln]: i.LINEAR_MIPMAP_LINEAR,
    },
    N = {
      [sg]: i.NEVER,
      [ug]: i.ALWAYS,
      [og]: i.LESS,
      [jp]: i.LEQUAL,
      [rg]: i.EQUAL,
      [cg]: i.GEQUAL,
      [ag]: i.GREATER,
      [lg]: i.NOTEQUAL,
    };
  function Q(R, I) {
    if (
      (I.type === as &&
        e.has("OES_texture_float_linear") === !1 &&
        (I.magFilter === Zt ||
          I.magFilter === _c ||
          I.magFilter === Y0 ||
          I.magFilter === Ln ||
          I.minFilter === Zt ||
          I.minFilter === _c ||
          I.minFilter === Y0 ||
          I.minFilter === Ln) &&
        console.warn(
          "THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.",
        ),
      i.texParameteri(R, i.TEXTURE_WRAP_S, G[I.wrapS]),
      i.texParameteri(R, i.TEXTURE_WRAP_T, G[I.wrapT]),
      (R === i.TEXTURE_3D || R === i.TEXTURE_2D_ARRAY) &&
        i.texParameteri(R, i.TEXTURE_WRAP_R, G[I.wrapR]),
      i.texParameteri(R, i.TEXTURE_MAG_FILTER, j[I.magFilter]),
      i.texParameteri(R, i.TEXTURE_MIN_FILTER, j[I.minFilter]),
      I.compareFunction &&
        (i.texParameteri(R, i.TEXTURE_COMPARE_MODE, i.COMPARE_REF_TO_TEXTURE),
        i.texParameteri(R, i.TEXTURE_COMPARE_FUNC, N[I.compareFunction])),
      e.has("EXT_texture_filter_anisotropic") === !0)
    ) {
      if (
        I.magFilter === Gn ||
        (I.minFilter !== Y0 && I.minFilter !== Ln) ||
        (I.type === as && e.has("OES_texture_float_linear") === !1)
      )
        return;
      if (I.anisotropy > 1 || n.get(I).__currentAnisotropy) {
        let se = e.get("EXT_texture_filter_anisotropic");
        i.texParameterf(
          R,
          se.TEXTURE_MAX_ANISOTROPY_EXT,
          Math.min(I.anisotropy, s.getMaxAnisotropy()),
        ),
          (n.get(I).__currentAnisotropy = I.anisotropy);
      }
    }
  }
  function K(R, I) {
    let se = !1;
    R.__webglInit === void 0 && ((R.__webglInit = !0), I.addEventListener("dispose", _));
    let ae = I.source,
      k = f.get(ae);
    k === void 0 && ((k = {}), f.set(ae, k));
    let ce = q(I);
    if (ce !== R.__cacheKey) {
      k[ce] === void 0 &&
        ((k[ce] = { texture: i.createTexture(), usedTimes: 0 }), r.memory.textures++, (se = !0)),
        k[ce].usedTimes++;
      let ve = k[R.__cacheKey];
      ve !== void 0 && (k[R.__cacheKey].usedTimes--, ve.usedTimes === 0 && w(I)),
        (R.__cacheKey = ce),
        (R.__webglTexture = k[ce].texture);
    }
    return se;
  }
  function ie(R, I, se) {
    return Math.floor(Math.floor(R / se) / I);
  }
  function F(R, I, se, ae) {
    let ce = R.updateRanges;
    if (ce.length === 0)
      t.texSubImage2D(i.TEXTURE_2D, 0, 0, 0, I.width, I.height, se, ae, I.data);
    else {
      ce.sort((Re, Fe) => Re.start - Fe.start);
      let ve = 0;
      for (let Re = 1; Re < ce.length; Re++) {
        let Fe = ce[ve],
          ze = ce[Re],
          We = Fe.start + Fe.count,
          Ne = ie(ze.start, I.width, 4),
          dt = ie(Fe.start, I.width, 4);
        ze.start <= We + 1 && Ne === dt && ie(ze.start + ze.count - 1, I.width, 4) === Ne
          ? (Fe.count = Math.max(Fe.count, ze.start + ze.count - Fe.start))
          : (++ve, (ce[ve] = ze));
      }
      ce.length = ve + 1;
      let _e = i.getParameter(i.UNPACK_ROW_LENGTH),
        Te = i.getParameter(i.UNPACK_SKIP_PIXELS),
        Pe = i.getParameter(i.UNPACK_SKIP_ROWS);
      i.pixelStorei(i.UNPACK_ROW_LENGTH, I.width);
      for (let Re = 0, Fe = ce.length; Re < Fe; Re++) {
        let ze = ce[Re],
          We = Math.floor(ze.start / 4),
          Ne = Math.ceil(ze.count / 4),
          dt = We % I.width,
          xe = Math.floor(We / I.width),
          Ie = Ne,
          Be = 1;
        i.pixelStorei(i.UNPACK_SKIP_PIXELS, dt),
          i.pixelStorei(i.UNPACK_SKIP_ROWS, xe),
          t.texSubImage2D(i.TEXTURE_2D, 0, dt, xe, Ie, Be, se, ae, I.data);
      }
      R.clearUpdateRanges(),
        i.pixelStorei(i.UNPACK_ROW_LENGTH, _e),
        i.pixelStorei(i.UNPACK_SKIP_PIXELS, Te),
        i.pixelStorei(i.UNPACK_SKIP_ROWS, Pe);
    }
  }
  function X(R, I, se) {
    let ae = i.TEXTURE_2D;
    (I.isDataArrayTexture || I.isCompressedArrayTexture) && (ae = i.TEXTURE_2D_ARRAY),
      I.isData3DTexture && (ae = i.TEXTURE_3D);
    let k = K(R, I),
      ce = I.source;
    t.bindTexture(ae, R.__webglTexture, i.TEXTURE0 + se);
    let ve = n.get(ce);
    if (ce.version !== ve.__version || k === !0) {
      t.activeTexture(i.TEXTURE0 + se);
      let _e = Kt.getPrimaries(Kt.workingColorSpace),
        Te = I.colorSpace === hi ? null : Kt.getPrimaries(I.colorSpace),
        Pe = I.colorSpace === hi || _e === Te ? i.NONE : i.BROWSER_DEFAULT_WEBGL;
      i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL, I.flipY),
        i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL, I.premultiplyAlpha),
        i.pixelStorei(i.UNPACK_ALIGNMENT, I.unpackAlignment),
        i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL, Pe);
      let Re = v(I.image, !1, s.maxTextureSize);
      Re = fe(I, Re);
      let Fe = o.convert(I.format, I.colorSpace),
        ze = o.convert(I.type),
        We = b(I.internalFormat, Fe, ze, I.colorSpace, I.isVideoTexture);
      Q(ae, I);
      let Ne,
        dt = I.mipmaps,
        xe = I.isVideoTexture !== !0,
        Ie = ve.__version === void 0 || k === !0,
        Be = ce.dataReady,
        Xe = A(I, Re);
      if (I.isDepthTexture)
        (We = m(I.format === j0, I.type)),
          Ie &&
            (xe
              ? t.texStorage2D(i.TEXTURE_2D, 1, We, Re.width, Re.height)
              : t.texImage2D(i.TEXTURE_2D, 0, We, Re.width, Re.height, 0, Fe, ze, null));
      else if (I.isDataTexture)
        if (dt.length > 0) {
          xe && Ie && t.texStorage2D(i.TEXTURE_2D, Xe, We, dt[0].width, dt[0].height);
          for (let Me = 0, we = dt.length; Me < we; Me++)
            (Ne = dt[Me]),
              xe
                ? Be &&
                  t.texSubImage2D(i.TEXTURE_2D, Me, 0, 0, Ne.width, Ne.height, Fe, ze, Ne.data)
                : t.texImage2D(i.TEXTURE_2D, Me, We, Ne.width, Ne.height, 0, Fe, ze, Ne.data);
          I.generateMipmaps = !1;
        } else
          xe
            ? (Ie && t.texStorage2D(i.TEXTURE_2D, Xe, We, Re.width, Re.height),
              Be && F(I, Re, Fe, ze))
            : t.texImage2D(i.TEXTURE_2D, 0, We, Re.width, Re.height, 0, Fe, ze, Re.data);
      else if (I.isCompressedTexture)
        if (I.isCompressedArrayTexture) {
          xe &&
            Ie &&
            t.texStorage3D(i.TEXTURE_2D_ARRAY, Xe, We, dt[0].width, dt[0].height, Re.depth);
          for (let Me = 0, we = dt.length; Me < we; Me++)
            if (((Ne = dt[Me]), I.format !== _n))
              if (Fe !== null)
                if (xe) {
                  if (Be)
                    if (I.layerUpdates.size > 0) {
                      let be = Jp(Ne.width, Ne.height, I.format, I.type);
                      for (let Oe of I.layerUpdates) {
                        let pt = Ne.data.subarray(
                          (Oe * be) / Ne.data.BYTES_PER_ELEMENT,
                          ((Oe + 1) * be) / Ne.data.BYTES_PER_ELEMENT,
                        );
                        t.compressedTexSubImage3D(
                          i.TEXTURE_2D_ARRAY,
                          Me,
                          0,
                          0,
                          Oe,
                          Ne.width,
                          Ne.height,
                          1,
                          Fe,
                          pt,
                        );
                      }
                      I.clearLayerUpdates();
                    } else
                      t.compressedTexSubImage3D(
                        i.TEXTURE_2D_ARRAY,
                        Me,
                        0,
                        0,
                        0,
                        Ne.width,
                        Ne.height,
                        Re.depth,
                        Fe,
                        Ne.data,
                      );
                } else
                  t.compressedTexImage3D(
                    i.TEXTURE_2D_ARRAY,
                    Me,
                    We,
                    Ne.width,
                    Ne.height,
                    Re.depth,
                    0,
                    Ne.data,
                    0,
                    0,
                  );
              else
                console.warn(
                  "THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()",
                );
            else
              xe
                ? Be &&
                  t.texSubImage3D(
                    i.TEXTURE_2D_ARRAY,
                    Me,
                    0,
                    0,
                    0,
                    Ne.width,
                    Ne.height,
                    Re.depth,
                    Fe,
                    ze,
                    Ne.data,
                  )
                : t.texImage3D(
                    i.TEXTURE_2D_ARRAY,
                    Me,
                    We,
                    Ne.width,
                    Ne.height,
                    Re.depth,
                    0,
                    Fe,
                    ze,
                    Ne.data,
                  );
        } else {
          xe && Ie && t.texStorage2D(i.TEXTURE_2D, Xe, We, dt[0].width, dt[0].height);
          for (let Me = 0, we = dt.length; Me < we; Me++)
            (Ne = dt[Me]),
              I.format !== _n
                ? Fe !== null
                  ? xe
                    ? Be &&
                      t.compressedTexSubImage2D(
                        i.TEXTURE_2D,
                        Me,
                        0,
                        0,
                        Ne.width,
                        Ne.height,
                        Fe,
                        Ne.data,
                      )
                    : t.compressedTexImage2D(
                        i.TEXTURE_2D,
                        Me,
                        We,
                        Ne.width,
                        Ne.height,
                        0,
                        Ne.data,
                      )
                  : console.warn(
                      "THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()",
                    )
                : xe
                  ? Be &&
                    t.texSubImage2D(i.TEXTURE_2D, Me, 0, 0, Ne.width, Ne.height, Fe, ze, Ne.data)
                  : t.texImage2D(i.TEXTURE_2D, Me, We, Ne.width, Ne.height, 0, Fe, ze, Ne.data);
        }
      else if (I.isDataArrayTexture)
        if (xe) {
          if (
            (Ie && t.texStorage3D(i.TEXTURE_2D_ARRAY, Xe, We, Re.width, Re.height, Re.depth), Be)
          )
            if (I.layerUpdates.size > 0) {
              let Me = Jp(Re.width, Re.height, I.format, I.type);
              for (let we of I.layerUpdates) {
                let be = Re.data.subarray(
                  (we * Me) / Re.data.BYTES_PER_ELEMENT,
                  ((we + 1) * Me) / Re.data.BYTES_PER_ELEMENT,
                );
                t.texSubImage3D(
                  i.TEXTURE_2D_ARRAY,
                  0,
                  0,
                  0,
                  we,
                  Re.width,
                  Re.height,
                  1,
                  Fe,
                  ze,
                  be,
                );
              }
              I.clearLayerUpdates();
            } else
              t.texSubImage3D(
                i.TEXTURE_2D_ARRAY,
                0,
                0,
                0,
                0,
                Re.width,
                Re.height,
                Re.depth,
                Fe,
                ze,
                Re.data,
              );
        } else
          t.texImage3D(
            i.TEXTURE_2D_ARRAY,
            0,
            We,
            Re.width,
            Re.height,
            Re.depth,
            0,
            Fe,
            ze,
            Re.data,
          );
      else if (I.isData3DTexture)
        xe
          ? (Ie && t.texStorage3D(i.TEXTURE_3D, Xe, We, Re.width, Re.height, Re.depth),
            Be &&
              t.texSubImage3D(
                i.TEXTURE_3D,
                0,
                0,
                0,
                0,
                Re.width,
                Re.height,
                Re.depth,
                Fe,
                ze,
                Re.data,
              ))
          : t.texImage3D(i.TEXTURE_3D, 0, We, Re.width, Re.height, Re.depth, 0, Fe, ze, Re.data);
      else if (I.isFramebufferTexture) {
        if (Ie)
          if (xe) t.texStorage2D(i.TEXTURE_2D, Xe, We, Re.width, Re.height);
          else {
            let Me = Re.width,
              we = Re.height;
            for (let be = 0; be < Xe; be++)
              t.texImage2D(i.TEXTURE_2D, be, We, Me, we, 0, Fe, ze, null), (Me >>= 1), (we >>= 1);
          }
      } else if (dt.length > 0) {
        if (xe && Ie) {
          let Me = le(dt[0]);
          t.texStorage2D(i.TEXTURE_2D, Xe, We, Me.width, Me.height);
        }
        for (let Me = 0, we = dt.length; Me < we; Me++)
          (Ne = dt[Me]),
            xe
              ? Be && t.texSubImage2D(i.TEXTURE_2D, Me, 0, 0, Fe, ze, Ne)
              : t.texImage2D(i.TEXTURE_2D, Me, We, Fe, ze, Ne);
        I.generateMipmaps = !1;
      } else if (xe) {
        if (Ie) {
          let Me = le(Re);
          t.texStorage2D(i.TEXTURE_2D, Xe, We, Me.width, Me.height);
        }
        Be && t.texSubImage2D(i.TEXTURE_2D, 0, 0, 0, Fe, ze, Re);
      } else t.texImage2D(i.TEXTURE_2D, 0, We, Fe, ze, Re);
      g(I) && x(ae), (ve.__version = ce.version), I.onUpdate && I.onUpdate(I);
    }
    R.__version = I.version;
  }
  function ne(R, I, se) {
    if (I.image.length !== 6) return;
    let ae = K(R, I),
      k = I.source;
    t.bindTexture(i.TEXTURE_CUBE_MAP, R.__webglTexture, i.TEXTURE0 + se);
    let ce = n.get(k);
    if (k.version !== ce.__version || ae === !0) {
      t.activeTexture(i.TEXTURE0 + se);
      let ve = Kt.getPrimaries(Kt.workingColorSpace),
        _e = I.colorSpace === hi ? null : Kt.getPrimaries(I.colorSpace),
        Te = I.colorSpace === hi || ve === _e ? i.NONE : i.BROWSER_DEFAULT_WEBGL;
      i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL, I.flipY),
        i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL, I.premultiplyAlpha),
        i.pixelStorei(i.UNPACK_ALIGNMENT, I.unpackAlignment),
        i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL, Te);
      let Pe = I.isCompressedTexture || I.image[0].isCompressedTexture,
        Re = I.image[0] && I.image[0].isDataTexture,
        Fe = [];
      for (let we = 0; we < 6; we++)
        !Pe && !Re
          ? (Fe[we] = v(I.image[we], !0, s.maxCubemapSize))
          : (Fe[we] = Re ? I.image[we].image : I.image[we]),
          (Fe[we] = fe(I, Fe[we]));
      let ze = Fe[0],
        We = o.convert(I.format, I.colorSpace),
        Ne = o.convert(I.type),
        dt = b(I.internalFormat, We, Ne, I.colorSpace),
        xe = I.isVideoTexture !== !0,
        Ie = ce.__version === void 0 || ae === !0,
        Be = k.dataReady,
        Xe = A(I, ze);
      Q(i.TEXTURE_CUBE_MAP, I);
      let Me;
      if (Pe) {
        xe && Ie && t.texStorage2D(i.TEXTURE_CUBE_MAP, Xe, dt, ze.width, ze.height);
        for (let we = 0; we < 6; we++) {
          Me = Fe[we].mipmaps;
          for (let be = 0; be < Me.length; be++) {
            let Oe = Me[be];
            I.format !== _n
              ? We !== null
                ? xe
                  ? Be &&
                    t.compressedTexSubImage2D(
                      i.TEXTURE_CUBE_MAP_POSITIVE_X + we,
                      be,
                      0,
                      0,
                      Oe.width,
                      Oe.height,
                      We,
                      Oe.data,
                    )
                  : t.compressedTexImage2D(
                      i.TEXTURE_CUBE_MAP_POSITIVE_X + we,
                      be,
                      dt,
                      Oe.width,
                      Oe.height,
                      0,
                      Oe.data,
                    )
                : console.warn(
                    "THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()",
                  )
              : xe
                ? Be &&
                  t.texSubImage2D(
                    i.TEXTURE_CUBE_MAP_POSITIVE_X + we,
                    be,
                    0,
                    0,
                    Oe.width,
                    Oe.height,
                    We,
                    Ne,
                    Oe.data,
                  )
                : t.texImage2D(
                    i.TEXTURE_CUBE_MAP_POSITIVE_X + we,
                    be,
                    dt,
                    Oe.width,
                    Oe.height,
                    0,
                    We,
                    Ne,
                    Oe.data,
                  );
          }
        }
      } else {
        if (((Me = I.mipmaps), xe && Ie)) {
          Me.length > 0 && Xe++;
          let we = le(Fe[0]);
          t.texStorage2D(i.TEXTURE_CUBE_MAP, Xe, dt, we.width, we.height);
        }
        for (let we = 0; we < 6; we++)
          if (Re) {
            xe
              ? Be &&
                t.texSubImage2D(
                  i.TEXTURE_CUBE_MAP_POSITIVE_X + we,
                  0,
                  0,
                  0,
                  Fe[we].width,
                  Fe[we].height,
                  We,
                  Ne,
                  Fe[we].data,
                )
              : t.texImage2D(
                  i.TEXTURE_CUBE_MAP_POSITIVE_X + we,
                  0,
                  dt,
                  Fe[we].width,
                  Fe[we].height,
                  0,
                  We,
                  Ne,
                  Fe[we].data,
                );
            for (let be = 0; be < Me.length; be++) {
              let pt = Me[be].image[we].image;
              xe
                ? Be &&
                  t.texSubImage2D(
                    i.TEXTURE_CUBE_MAP_POSITIVE_X + we,
                    be + 1,
                    0,
                    0,
                    pt.width,
                    pt.height,
                    We,
                    Ne,
                    pt.data,
                  )
                : t.texImage2D(
                    i.TEXTURE_CUBE_MAP_POSITIVE_X + we,
                    be + 1,
                    dt,
                    pt.width,
                    pt.height,
                    0,
                    We,
                    Ne,
                    pt.data,
                  );
            }
          } else {
            xe
              ? Be && t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + we, 0, 0, 0, We, Ne, Fe[we])
              : t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + we, 0, dt, We, Ne, Fe[we]);
            for (let be = 0; be < Me.length; be++) {
              let Oe = Me[be];
              xe
                ? Be &&
                  t.texSubImage2D(
                    i.TEXTURE_CUBE_MAP_POSITIVE_X + we,
                    be + 1,
                    0,
                    0,
                    We,
                    Ne,
                    Oe.image[we],
                  )
                : t.texImage2D(
                    i.TEXTURE_CUBE_MAP_POSITIVE_X + we,
                    be + 1,
                    dt,
                    We,
                    Ne,
                    Oe.image[we],
                  );
            }
          }
      }
      g(I) && x(i.TEXTURE_CUBE_MAP), (ce.__version = k.version), I.onUpdate && I.onUpdate(I);
    }
    R.__version = I.version;
  }
  function re(R, I, se, ae, k, ce) {
    let ve = o.convert(se.format, se.colorSpace),
      _e = o.convert(se.type),
      Te = b(se.internalFormat, ve, _e, se.colorSpace),
      Pe = n.get(I),
      Re = n.get(se);
    if (((Re.__renderTarget = I), !Pe.__hasExternalTextures)) {
      let Fe = Math.max(1, I.width >> ce),
        ze = Math.max(1, I.height >> ce);
      k === i.TEXTURE_3D || k === i.TEXTURE_2D_ARRAY
        ? t.texImage3D(k, ce, Te, Fe, ze, I.depth, 0, ve, _e, null)
        : t.texImage2D(k, ce, Te, Fe, ze, 0, ve, _e, null);
    }
    t.bindFramebuffer(i.FRAMEBUFFER, R),
      J(I)
        ? a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER, ae, k, Re.__webglTexture, 0, Z(I))
        : (k === i.TEXTURE_2D ||
            (k >= i.TEXTURE_CUBE_MAP_POSITIVE_X && k <= i.TEXTURE_CUBE_MAP_NEGATIVE_Z)) &&
          i.framebufferTexture2D(i.FRAMEBUFFER, ae, k, Re.__webglTexture, ce),
      t.bindFramebuffer(i.FRAMEBUFFER, null);
  }
  function $(R, I, se) {
    if ((i.bindRenderbuffer(i.RENDERBUFFER, R), I.depthBuffer)) {
      let ae = I.depthTexture,
        k = ae && ae.isDepthTexture ? ae.type : null,
        ce = m(I.stencilBuffer, k),
        ve = I.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT,
        _e = Z(I);
      J(I)
        ? a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER, _e, ce, I.width, I.height)
        : se
          ? i.renderbufferStorageMultisample(i.RENDERBUFFER, _e, ce, I.width, I.height)
          : i.renderbufferStorage(i.RENDERBUFFER, ce, I.width, I.height),
        i.framebufferRenderbuffer(i.FRAMEBUFFER, ve, i.RENDERBUFFER, R);
    } else {
      let ae = I.textures;
      for (let k = 0; k < ae.length; k++) {
        let ce = ae[k],
          ve = o.convert(ce.format, ce.colorSpace),
          _e = o.convert(ce.type),
          Te = b(ce.internalFormat, ve, _e, ce.colorSpace),
          Pe = Z(I);
        se && J(I) === !1
          ? i.renderbufferStorageMultisample(i.RENDERBUFFER, Pe, Te, I.width, I.height)
          : J(I)
            ? a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER, Pe, Te, I.width, I.height)
            : i.renderbufferStorage(i.RENDERBUFFER, Te, I.width, I.height);
      }
    }
    i.bindRenderbuffer(i.RENDERBUFFER, null);
  }
  function ue(R, I) {
    if (I && I.isWebGLCubeRenderTarget)
      throw new Error("Depth Texture with cube render targets is not supported");
    if ((t.bindFramebuffer(i.FRAMEBUFFER, R), !(I.depthTexture && I.depthTexture.isDepthTexture)))
      throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");
    let ae = n.get(I.depthTexture);
    (ae.__renderTarget = I),
      (!ae.__webglTexture ||
        I.depthTexture.image.width !== I.width ||
        I.depthTexture.image.height !== I.height) &&
        ((I.depthTexture.image.width = I.width),
        (I.depthTexture.image.height = I.height),
        (I.depthTexture.needsUpdate = !0)),
      U(I.depthTexture, 0);
    let k = ae.__webglTexture,
      ce = Z(I);
    if (I.depthTexture.format === E0)
      J(I)
        ? a.framebufferTexture2DMultisampleEXT(
            i.FRAMEBUFFER,
            i.DEPTH_ATTACHMENT,
            i.TEXTURE_2D,
            k,
            0,
            ce,
          )
        : i.framebufferTexture2D(i.FRAMEBUFFER, i.DEPTH_ATTACHMENT, i.TEXTURE_2D, k, 0);
    else if (I.depthTexture.format === j0)
      J(I)
        ? a.framebufferTexture2DMultisampleEXT(
            i.FRAMEBUFFER,
            i.DEPTH_STENCIL_ATTACHMENT,
            i.TEXTURE_2D,
            k,
            0,
            ce,
          )
        : i.framebufferTexture2D(i.FRAMEBUFFER, i.DEPTH_STENCIL_ATTACHMENT, i.TEXTURE_2D, k, 0);
    else throw new Error("Unknown depthTexture format");
  }
  function me(R) {
    let I = n.get(R),
      se = R.isWebGLCubeRenderTarget === !0;
    if (I.__boundDepthTexture !== R.depthTexture) {
      let ae = R.depthTexture;
      if ((I.__depthDisposeCallback && I.__depthDisposeCallback(), ae)) {
        let k = () => {
          delete I.__boundDepthTexture,
            delete I.__depthDisposeCallback,
            ae.removeEventListener("dispose", k);
        };
        ae.addEventListener("dispose", k), (I.__depthDisposeCallback = k);
      }
      I.__boundDepthTexture = ae;
    }
    if (R.depthTexture && !I.__autoAllocateDepthBuffer) {
      if (se) throw new Error("target.depthTexture not supported in Cube render targets");
      let ae = R.texture.mipmaps;
      ae && ae.length > 0 ? ue(I.__webglFramebuffer[0], R) : ue(I.__webglFramebuffer, R);
    } else if (se) {
      I.__webglDepthbuffer = [];
      for (let ae = 0; ae < 6; ae++)
        if (
          (t.bindFramebuffer(i.FRAMEBUFFER, I.__webglFramebuffer[ae]),
          I.__webglDepthbuffer[ae] === void 0)
        )
          (I.__webglDepthbuffer[ae] = i.createRenderbuffer()), $(I.__webglDepthbuffer[ae], R, !1);
        else {
          let k = R.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT,
            ce = I.__webglDepthbuffer[ae];
          i.bindRenderbuffer(i.RENDERBUFFER, ce),
            i.framebufferRenderbuffer(i.FRAMEBUFFER, k, i.RENDERBUFFER, ce);
        }
    } else {
      let ae = R.texture.mipmaps;
      if (
        (ae && ae.length > 0
          ? t.bindFramebuffer(i.FRAMEBUFFER, I.__webglFramebuffer[0])
          : t.bindFramebuffer(i.FRAMEBUFFER, I.__webglFramebuffer),
        I.__webglDepthbuffer === void 0)
      )
        (I.__webglDepthbuffer = i.createRenderbuffer()), $(I.__webglDepthbuffer, R, !1);
      else {
        let k = R.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT,
          ce = I.__webglDepthbuffer;
        i.bindRenderbuffer(i.RENDERBUFFER, ce),
          i.framebufferRenderbuffer(i.FRAMEBUFFER, k, i.RENDERBUFFER, ce);
      }
    }
    t.bindFramebuffer(i.FRAMEBUFFER, null);
  }
  function ee(R, I, se) {
    let ae = n.get(R);
    I !== void 0 && re(ae.__webglFramebuffer, R, R.texture, i.COLOR_ATTACHMENT0, i.TEXTURE_2D, 0),
      se !== void 0 && me(R);
  }
  function B(R) {
    let I = R.texture,
      se = n.get(R),
      ae = n.get(I);
    R.addEventListener("dispose", M);
    let k = R.textures,
      ce = R.isWebGLCubeRenderTarget === !0,
      ve = k.length > 1;
    if (
      (ve ||
        (ae.__webglTexture === void 0 && (ae.__webglTexture = i.createTexture()),
        (ae.__version = I.version),
        r.memory.textures++),
      ce)
    ) {
      se.__webglFramebuffer = [];
      for (let _e = 0; _e < 6; _e++)
        if (I.mipmaps && I.mipmaps.length > 0) {
          se.__webglFramebuffer[_e] = [];
          for (let Te = 0; Te < I.mipmaps.length; Te++)
            se.__webglFramebuffer[_e][Te] = i.createFramebuffer();
        } else se.__webglFramebuffer[_e] = i.createFramebuffer();
    } else {
      if (I.mipmaps && I.mipmaps.length > 0) {
        se.__webglFramebuffer = [];
        for (let _e = 0; _e < I.mipmaps.length; _e++)
          se.__webglFramebuffer[_e] = i.createFramebuffer();
      } else se.__webglFramebuffer = i.createFramebuffer();
      if (ve)
        for (let _e = 0, Te = k.length; _e < Te; _e++) {
          let Pe = n.get(k[_e]);
          Pe.__webglTexture === void 0 &&
            ((Pe.__webglTexture = i.createTexture()), r.memory.textures++);
        }
      if (R.samples > 0 && J(R) === !1) {
        (se.__webglMultisampledFramebuffer = i.createFramebuffer()),
          (se.__webglColorRenderbuffer = []),
          t.bindFramebuffer(i.FRAMEBUFFER, se.__webglMultisampledFramebuffer);
        for (let _e = 0; _e < k.length; _e++) {
          let Te = k[_e];
          (se.__webglColorRenderbuffer[_e] = i.createRenderbuffer()),
            i.bindRenderbuffer(i.RENDERBUFFER, se.__webglColorRenderbuffer[_e]);
          let Pe = o.convert(Te.format, Te.colorSpace),
            Re = o.convert(Te.type),
            Fe = b(Te.internalFormat, Pe, Re, Te.colorSpace, R.isXRRenderTarget === !0),
            ze = Z(R);
          i.renderbufferStorageMultisample(i.RENDERBUFFER, ze, Fe, R.width, R.height),
            i.framebufferRenderbuffer(
              i.FRAMEBUFFER,
              i.COLOR_ATTACHMENT0 + _e,
              i.RENDERBUFFER,
              se.__webglColorRenderbuffer[_e],
            );
        }
        i.bindRenderbuffer(i.RENDERBUFFER, null),
          R.depthBuffer &&
            ((se.__webglDepthRenderbuffer = i.createRenderbuffer()),
            $(se.__webglDepthRenderbuffer, R, !0)),
          t.bindFramebuffer(i.FRAMEBUFFER, null);
      }
    }
    if (ce) {
      t.bindTexture(i.TEXTURE_CUBE_MAP, ae.__webglTexture), Q(i.TEXTURE_CUBE_MAP, I);
      for (let _e = 0; _e < 6; _e++)
        if (I.mipmaps && I.mipmaps.length > 0)
          for (let Te = 0; Te < I.mipmaps.length; Te++)
            re(
              se.__webglFramebuffer[_e][Te],
              R,
              I,
              i.COLOR_ATTACHMENT0,
              i.TEXTURE_CUBE_MAP_POSITIVE_X + _e,
              Te,
            );
        else
          re(
            se.__webglFramebuffer[_e],
            R,
            I,
            i.COLOR_ATTACHMENT0,
            i.TEXTURE_CUBE_MAP_POSITIVE_X + _e,
            0,
          );
      g(I) && x(i.TEXTURE_CUBE_MAP), t.unbindTexture();
    } else if (ve) {
      for (let _e = 0, Te = k.length; _e < Te; _e++) {
        let Pe = k[_e],
          Re = n.get(Pe),
          Fe = i.TEXTURE_2D;
        (R.isWebGL3DRenderTarget || R.isWebGLArrayRenderTarget) &&
          (Fe = R.isWebGL3DRenderTarget ? i.TEXTURE_3D : i.TEXTURE_2D_ARRAY),
          t.bindTexture(Fe, Re.__webglTexture),
          Q(Fe, Pe),
          re(se.__webglFramebuffer, R, Pe, i.COLOR_ATTACHMENT0 + _e, Fe, 0),
          g(Pe) && x(Fe);
      }
      t.unbindTexture();
    } else {
      let _e = i.TEXTURE_2D;
      if (
        ((R.isWebGL3DRenderTarget || R.isWebGLArrayRenderTarget) &&
          (_e = R.isWebGL3DRenderTarget ? i.TEXTURE_3D : i.TEXTURE_2D_ARRAY),
        t.bindTexture(_e, ae.__webglTexture),
        Q(_e, I),
        I.mipmaps && I.mipmaps.length > 0)
      )
        for (let Te = 0; Te < I.mipmaps.length; Te++)
          re(se.__webglFramebuffer[Te], R, I, i.COLOR_ATTACHMENT0, _e, Te);
      else re(se.__webglFramebuffer, R, I, i.COLOR_ATTACHMENT0, _e, 0);
      g(I) && x(_e), t.unbindTexture();
    }
    R.depthBuffer && me(R);
  }
  function P(R) {
    let I = R.textures;
    for (let se = 0, ae = I.length; se < ae; se++) {
      let k = I[se];
      if (g(k)) {
        let ce = y(R),
          ve = n.get(k).__webglTexture;
        t.bindTexture(ce, ve), x(ce), t.unbindTexture();
      }
    }
  }
  let V = [],
    Y = [];
  function L(R) {
    if (R.samples > 0) {
      if (J(R) === !1) {
        let I = R.textures,
          se = R.width,
          ae = R.height,
          k = i.COLOR_BUFFER_BIT,
          ce = R.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT,
          ve = n.get(R),
          _e = I.length > 1;
        if (_e)
          for (let Pe = 0; Pe < I.length; Pe++)
            t.bindFramebuffer(i.FRAMEBUFFER, ve.__webglMultisampledFramebuffer),
              i.framebufferRenderbuffer(
                i.FRAMEBUFFER,
                i.COLOR_ATTACHMENT0 + Pe,
                i.RENDERBUFFER,
                null,
              ),
              t.bindFramebuffer(i.FRAMEBUFFER, ve.__webglFramebuffer),
              i.framebufferTexture2D(
                i.DRAW_FRAMEBUFFER,
                i.COLOR_ATTACHMENT0 + Pe,
                i.TEXTURE_2D,
                null,
                0,
              );
        t.bindFramebuffer(i.READ_FRAMEBUFFER, ve.__webglMultisampledFramebuffer);
        let Te = R.texture.mipmaps;
        Te && Te.length > 0
          ? t.bindFramebuffer(i.DRAW_FRAMEBUFFER, ve.__webglFramebuffer[0])
          : t.bindFramebuffer(i.DRAW_FRAMEBUFFER, ve.__webglFramebuffer);
        for (let Pe = 0; Pe < I.length; Pe++) {
          if (
            (R.resolveDepthBuffer &&
              (R.depthBuffer && (k |= i.DEPTH_BUFFER_BIT),
              R.stencilBuffer && R.resolveStencilBuffer && (k |= i.STENCIL_BUFFER_BIT)),
            _e)
          ) {
            i.framebufferRenderbuffer(
              i.READ_FRAMEBUFFER,
              i.COLOR_ATTACHMENT0,
              i.RENDERBUFFER,
              ve.__webglColorRenderbuffer[Pe],
            );
            let Re = n.get(I[Pe]).__webglTexture;
            i.framebufferTexture2D(i.DRAW_FRAMEBUFFER, i.COLOR_ATTACHMENT0, i.TEXTURE_2D, Re, 0);
          }
          i.blitFramebuffer(0, 0, se, ae, 0, 0, se, ae, k, i.NEAREST),
            l === !0 &&
              ((V.length = 0),
              (Y.length = 0),
              V.push(i.COLOR_ATTACHMENT0 + Pe),
              R.depthBuffer &&
                R.resolveDepthBuffer === !1 &&
                (V.push(ce), Y.push(ce), i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER, Y)),
              i.invalidateFramebuffer(i.READ_FRAMEBUFFER, V));
        }
        if (
          (t.bindFramebuffer(i.READ_FRAMEBUFFER, null),
          t.bindFramebuffer(i.DRAW_FRAMEBUFFER, null),
          _e)
        )
          for (let Pe = 0; Pe < I.length; Pe++) {
            t.bindFramebuffer(i.FRAMEBUFFER, ve.__webglMultisampledFramebuffer),
              i.framebufferRenderbuffer(
                i.FRAMEBUFFER,
                i.COLOR_ATTACHMENT0 + Pe,
                i.RENDERBUFFER,
                ve.__webglColorRenderbuffer[Pe],
              );
            let Re = n.get(I[Pe]).__webglTexture;
            t.bindFramebuffer(i.FRAMEBUFFER, ve.__webglFramebuffer),
              i.framebufferTexture2D(
                i.DRAW_FRAMEBUFFER,
                i.COLOR_ATTACHMENT0 + Pe,
                i.TEXTURE_2D,
                Re,
                0,
              );
          }
        t.bindFramebuffer(i.DRAW_FRAMEBUFFER, ve.__webglMultisampledFramebuffer);
      } else if (R.depthBuffer && R.resolveDepthBuffer === !1 && l) {
        let I = R.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT;
        i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER, [I]);
      }
    }
  }
  function Z(R) {
    return Math.min(s.maxSamples, R.samples);
  }
  function J(R) {
    let I = n.get(R);
    return (
      R.samples > 0 &&
      e.has("WEBGL_multisampled_render_to_texture") === !0 &&
      I.__useRenderToTexture !== !1
    );
  }
  function oe(R) {
    let I = r.render.frame;
    u.get(R) !== I && (u.set(R, I), R.update());
  }
  function fe(R, I) {
    let se = R.colorSpace,
      ae = R.format,
      k = R.type;
    return (
      R.isCompressedTexture === !0 ||
        R.isVideoTexture === !0 ||
        (se !== Er &&
          se !== hi &&
          (Kt.getTransfer(se) === bn
            ? (ae !== _n || k !== yi) &&
              console.warn(
                "THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.",
              )
            : console.error("THREE.WebGLTextures: Unsupported texture color space:", se))),
      I
    );
  }
  function le(R) {
    return (
      typeof HTMLImageElement < "u" && R instanceof HTMLImageElement
        ? ((c.width = R.naturalWidth || R.width), (c.height = R.naturalHeight || R.height))
        : typeof VideoFrame < "u" && R instanceof VideoFrame
          ? ((c.width = R.displayWidth), (c.height = R.displayHeight))
          : ((c.width = R.width), (c.height = R.height)),
      c
    );
  }
  (this.allocateTextureUnit = O),
    (this.resetTextureUnits = H),
    (this.setTexture2D = U),
    (this.setTexture2DArray = T),
    (this.setTexture3D = D),
    (this.setTextureCube = C),
    (this.rebindTextures = ee),
    (this.setupRenderTarget = B),
    (this.updateRenderTargetMipmap = P),
    (this.updateMultisampleRenderTarget = L),
    (this.setupDepthRenderbuffer = me),
    (this.setupFrameBufferTexture = re),
    (this.useMultisampledRTT = J);
}
function Iy(i, e) {
  function t(n, s = hi) {
    let o,
      r = Kt.getTransfer(s);
    if (n === yi) return i.UNSIGNED_BYTE;
    if (n === kh) return i.UNSIGNED_SHORT_4_4_4_4;
    if (n === Fh) return i.UNSIGNED_SHORT_5_5_5_1;
    if (n === Gp) return i.UNSIGNED_INT_5_9_9_9_REV;
    if (n === qp) return i.UNSIGNED_INT_10F_11F_11F_REV;
    if (n === Vp) return i.BYTE;
    if (n === Wp) return i.SHORT;
    if (n === $0) return i.UNSIGNED_SHORT;
    if (n === Lh) return i.INT;
    if (n === Zs) return i.UNSIGNED_INT;
    if (n === as) return i.FLOAT;
    if (n === js) return i.HALF_FLOAT;
    if (n === Xp) return i.ALPHA;
    if (n === Yp) return i.RGB;
    if (n === _n) return i.RGBA;
    if (n === E0) return i.DEPTH_COMPONENT;
    if (n === j0) return i.DEPTH_STENCIL;
    if (n === J0) return i.RED;
    if (n === Mc) return i.RED_INTEGER;
    if (n === $p) return i.RG;
    if (n === Uh) return i.RG_INTEGER;
    if (n === Nh) return i.RGBA_INTEGER;
    if (n === wc || n === Ec || n === Sc || n === Tc)
      if (r === bn)
        if (((o = e.get("WEBGL_compressed_texture_s3tc_srgb")), o !== null)) {
          if (n === wc) return o.COMPRESSED_SRGB_S3TC_DXT1_EXT;
          if (n === Ec) return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
          if (n === Sc) return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
          if (n === Tc) return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
        } else return null;
      else if (((o = e.get("WEBGL_compressed_texture_s3tc")), o !== null)) {
        if (n === wc) return o.COMPRESSED_RGB_S3TC_DXT1_EXT;
        if (n === Ec) return o.COMPRESSED_RGBA_S3TC_DXT1_EXT;
        if (n === Sc) return o.COMPRESSED_RGBA_S3TC_DXT3_EXT;
        if (n === Tc) return o.COMPRESSED_RGBA_S3TC_DXT5_EXT;
      } else return null;
    if (n === Bh || n === Oh || n === Hh || n === Vh)
      if (((o = e.get("WEBGL_compressed_texture_pvrtc")), o !== null)) {
        if (n === Bh) return o.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
        if (n === Oh) return o.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
        if (n === Hh) return o.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
        if (n === Vh) return o.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
      } else return null;
    if (n === Wh || n === Gh || n === qh)
      if (((o = e.get("WEBGL_compressed_texture_etc")), o !== null)) {
        if (n === Wh || n === Gh)
          return r === bn ? o.COMPRESSED_SRGB8_ETC2 : o.COMPRESSED_RGB8_ETC2;
        if (n === qh)
          return r === bn ? o.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : o.COMPRESSED_RGBA8_ETC2_EAC;
      } else return null;
    if (
      n === Xh ||
      n === Yh ||
      n === $h ||
      n === Zh ||
      n === jh ||
      n === Jh ||
      n === Kh ||
      n === Qh ||
      n === ef ||
      n === tf ||
      n === nf ||
      n === sf ||
      n === of ||
      n === rf
    )
      if (((o = e.get("WEBGL_compressed_texture_astc")), o !== null)) {
        if (n === Xh)
          return r === bn
            ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR
            : o.COMPRESSED_RGBA_ASTC_4x4_KHR;
        if (n === Yh)
          return r === bn
            ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR
            : o.COMPRESSED_RGBA_ASTC_5x4_KHR;
        if (n === $h)
          return r === bn
            ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR
            : o.COMPRESSED_RGBA_ASTC_5x5_KHR;
        if (n === Zh)
          return r === bn
            ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR
            : o.COMPRESSED_RGBA_ASTC_6x5_KHR;
        if (n === jh)
          return r === bn
            ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR
            : o.COMPRESSED_RGBA_ASTC_6x6_KHR;
        if (n === Jh)
          return r === bn
            ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR
            : o.COMPRESSED_RGBA_ASTC_8x5_KHR;
        if (n === Kh)
          return r === bn
            ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR
            : o.COMPRESSED_RGBA_ASTC_8x6_KHR;
        if (n === Qh)
          return r === bn
            ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR
            : o.COMPRESSED_RGBA_ASTC_8x8_KHR;
        if (n === ef)
          return r === bn
            ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR
            : o.COMPRESSED_RGBA_ASTC_10x5_KHR;
        if (n === tf)
          return r === bn
            ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR
            : o.COMPRESSED_RGBA_ASTC_10x6_KHR;
        if (n === nf)
          return r === bn
            ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR
            : o.COMPRESSED_RGBA_ASTC_10x8_KHR;
        if (n === sf)
          return r === bn
            ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR
            : o.COMPRESSED_RGBA_ASTC_10x10_KHR;
        if (n === of)
          return r === bn
            ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR
            : o.COMPRESSED_RGBA_ASTC_12x10_KHR;
        if (n === rf)
          return r === bn
            ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR
            : o.COMPRESSED_RGBA_ASTC_12x12_KHR;
      } else return null;
    if (n === af || n === lf || n === cf)
      if (((o = e.get("EXT_texture_compression_bptc")), o !== null)) {
        if (n === af)
          return r === bn
            ? o.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT
            : o.COMPRESSED_RGBA_BPTC_UNORM_EXT;
        if (n === lf) return o.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;
        if (n === cf) return o.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT;
      } else return null;
    if (n === uf || n === hf || n === ff || n === df)
      if (((o = e.get("EXT_texture_compression_rgtc")), o !== null)) {
        if (n === uf) return o.COMPRESSED_RED_RGTC1_EXT;
        if (n === hf) return o.COMPRESSED_SIGNED_RED_RGTC1_EXT;
        if (n === ff) return o.COMPRESSED_RED_GREEN_RGTC2_EXT;
        if (n === df) return o.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT;
      } else return null;
    return n === Z0 ? i.UNSIGNED_INT_24_8 : i[n] !== void 0 ? i[n] : null;
  }
  return { convert: t };
}
var F6 = `
void main() {

	gl_Position = vec4( position, 1.0 );

}`,
  U6 = `
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,
  Dg = class {
    constructor() {
      (this.texture = null), (this.mesh = null), (this.depthNear = 0), (this.depthFar = 0);
    }
    init(e, t) {
      if (this.texture === null) {
        let n = new nc(e.texture);
        (e.depthNear !== t.depthNear || e.depthFar !== t.depthFar) &&
          ((this.depthNear = e.depthNear), (this.depthFar = e.depthFar)),
          (this.texture = n);
      }
    }
    getMesh(e) {
      if (this.texture !== null && this.mesh === null) {
        let t = e.cameras[0].viewport,
          n = new zn({
            vertexShader: F6,
            fragmentShader: U6,
            uniforms: {
              depthColor: { value: this.texture },
              depthWidth: { value: t.z },
              depthHeight: { value: t.w },
            },
          });
        this.mesh = new Qe(new rn(20, 20), n);
      }
      return this.mesh;
    }
    reset() {
      (this.texture = null), (this.mesh = null);
    }
    getDepthTexture() {
      return this.texture;
    }
  },
  Lg = class extends xo {
    constructor(e, t) {
      super();
      let n = this,
        s = null,
        o = 1,
        r = null,
        a = "local-floor",
        l = 1,
        c = null,
        u = null,
        h = null,
        f = null,
        p = null,
        d = null,
        v = typeof XRWebGLBinding < "u",
        g = new Dg(),
        x = {},
        y = t.getContextAttributes(),
        b = null,
        m = null,
        A = [],
        _ = [],
        M = new Ae(),
        E = null,
        w = new Wn();
      w.viewport = new Dt();
      let S = new Wn();
      S.viewport = new Dt();
      let z = [w, S],
        H = new yh(),
        O = null,
        q = null;
      (this.cameraAutoUpdate = !0),
        (this.enabled = !1),
        (this.isPresenting = !1),
        (this.getController = function (X) {
          let ne = A[X];
          return ne === void 0 && ((ne = new L0()), (A[X] = ne)), ne.getTargetRaySpace();
        }),
        (this.getControllerGrip = function (X) {
          let ne = A[X];
          return ne === void 0 && ((ne = new L0()), (A[X] = ne)), ne.getGripSpace();
        }),
        (this.getHand = function (X) {
          let ne = A[X];
          return ne === void 0 && ((ne = new L0()), (A[X] = ne)), ne.getHandSpace();
        });
      function U(X) {
        let ne = _.indexOf(X.inputSource);
        if (ne === -1) return;
        let re = A[ne];
        re !== void 0 &&
          (re.update(X.inputSource, X.frame, c || r),
          re.dispatchEvent({ type: X.type, data: X.inputSource }));
      }
      function T() {
        s.removeEventListener("select", U),
          s.removeEventListener("selectstart", U),
          s.removeEventListener("selectend", U),
          s.removeEventListener("squeeze", U),
          s.removeEventListener("squeezestart", U),
          s.removeEventListener("squeezeend", U),
          s.removeEventListener("end", T),
          s.removeEventListener("inputsourceschange", D);
        for (let X = 0; X < A.length; X++) {
          let ne = _[X];
          ne !== null && ((_[X] = null), A[X].disconnect(ne));
        }
        (O = null), (q = null), g.reset();
        for (let X in x) delete x[X];
        e.setRenderTarget(b),
          (p = null),
          (f = null),
          (h = null),
          (s = null),
          (m = null),
          F.stop(),
          (n.isPresenting = !1),
          e.setPixelRatio(E),
          e.setSize(M.width, M.height, !1),
          n.dispatchEvent({ type: "sessionend" });
      }
      (this.setFramebufferScaleFactor = function (X) {
        (o = X),
          n.isPresenting === !0 &&
            console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.");
      }),
        (this.setReferenceSpaceType = function (X) {
          (a = X),
            n.isPresenting === !0 &&
              console.warn(
                "THREE.WebXRManager: Cannot change reference space type while presenting.",
              );
        }),
        (this.getReferenceSpace = function () {
          return c || r;
        }),
        (this.setReferenceSpace = function (X) {
          c = X;
        }),
        (this.getBaseLayer = function () {
          return f !== null ? f : p;
        }),
        (this.getBinding = function () {
          return h === null && v && (h = new XRWebGLBinding(s, t)), h;
        }),
        (this.getFrame = function () {
          return d;
        }),
        (this.getSession = function () {
          return s;
        }),
        (this.setSession = async function (X) {
          if (((s = X), s !== null)) {
            if (
              ((b = e.getRenderTarget()),
              s.addEventListener("select", U),
              s.addEventListener("selectstart", U),
              s.addEventListener("selectend", U),
              s.addEventListener("squeeze", U),
              s.addEventListener("squeezestart", U),
              s.addEventListener("squeezeend", U),
              s.addEventListener("end", T),
              s.addEventListener("inputsourceschange", D),
              y.xrCompatible !== !0 && (await t.makeXRCompatible()),
              (E = e.getPixelRatio()),
              e.getSize(M),
              v && "createProjectionLayer" in XRWebGLBinding.prototype)
            ) {
              let re = null,
                $ = null,
                ue = null;
              y.depth &&
                ((ue = y.stencil ? t.DEPTH24_STENCIL8 : t.DEPTH_COMPONENT24),
                (re = y.stencil ? j0 : E0),
                ($ = y.stencil ? Z0 : Zs));
              let me = { colorFormat: t.RGBA8, depthFormat: ue, scaleFactor: o };
              (h = this.getBinding()),
                (f = h.createProjectionLayer(me)),
                s.updateRenderState({ layers: [f] }),
                e.setPixelRatio(1),
                e.setSize(f.textureWidth, f.textureHeight, !1),
                (m = new si(f.textureWidth, f.textureHeight, {
                  format: _n,
                  type: yi,
                  depthTexture: new Tr(
                    f.textureWidth,
                    f.textureHeight,
                    $,
                    void 0,
                    void 0,
                    void 0,
                    void 0,
                    void 0,
                    void 0,
                    re,
                  ),
                  stencilBuffer: y.stencil,
                  colorSpace: e.outputColorSpace,
                  samples: y.antialias ? 4 : 0,
                  resolveDepthBuffer: f.ignoreDepthValues === !1,
                  resolveStencilBuffer: f.ignoreDepthValues === !1,
                }));
            } else {
              let re = {
                antialias: y.antialias,
                alpha: !0,
                depth: y.depth,
                stencil: y.stencil,
                framebufferScaleFactor: o,
              };
              (p = new XRWebGLLayer(s, t, re)),
                s.updateRenderState({ baseLayer: p }),
                e.setPixelRatio(1),
                e.setSize(p.framebufferWidth, p.framebufferHeight, !1),
                (m = new si(p.framebufferWidth, p.framebufferHeight, {
                  format: _n,
                  type: yi,
                  colorSpace: e.outputColorSpace,
                  stencilBuffer: y.stencil,
                  resolveDepthBuffer: p.ignoreDepthValues === !1,
                  resolveStencilBuffer: p.ignoreDepthValues === !1,
                }));
            }
            (m.isXRRenderTarget = !0),
              this.setFoveation(l),
              (c = null),
              (r = await s.requestReferenceSpace(a)),
              F.setContext(s),
              F.start(),
              (n.isPresenting = !0),
              n.dispatchEvent({ type: "sessionstart" });
          }
        }),
        (this.getEnvironmentBlendMode = function () {
          if (s !== null) return s.environmentBlendMode;
        }),
        (this.getDepthTexture = function () {
          return g.getDepthTexture();
        });
      function D(X) {
        for (let ne = 0; ne < X.removed.length; ne++) {
          let re = X.removed[ne],
            $ = _.indexOf(re);
          $ >= 0 && ((_[$] = null), A[$].disconnect(re));
        }
        for (let ne = 0; ne < X.added.length; ne++) {
          let re = X.added[ne],
            $ = _.indexOf(re);
          if ($ === -1) {
            for (let me = 0; me < A.length; me++)
              if (me >= _.length) {
                _.push(re), ($ = me);
                break;
              } else if (_[me] === null) {
                (_[me] = re), ($ = me);
                break;
              }
            if ($ === -1) break;
          }
          let ue = A[$];
          ue && ue.connect(re);
        }
      }
      let C = new W(),
        G = new W();
      function j(X, ne, re) {
        C.setFromMatrixPosition(ne.matrixWorld), G.setFromMatrixPosition(re.matrixWorld);
        let $ = C.distanceTo(G),
          ue = ne.projectionMatrix.elements,
          me = re.projectionMatrix.elements,
          ee = ue[14] / (ue[10] - 1),
          B = ue[14] / (ue[10] + 1),
          P = (ue[9] + 1) / ue[5],
          V = (ue[9] - 1) / ue[5],
          Y = (ue[8] - 1) / ue[0],
          L = (me[8] + 1) / me[0],
          Z = ee * Y,
          J = ee * L,
          oe = $ / (-Y + L),
          fe = oe * -Y;
        if (
          (ne.matrixWorld.decompose(X.position, X.quaternion, X.scale),
          X.translateX(fe),
          X.translateZ(oe),
          X.matrixWorld.compose(X.position, X.quaternion, X.scale),
          X.matrixWorldInverse.copy(X.matrixWorld).invert(),
          ue[10] === -1)
        )
          X.projectionMatrix.copy(ne.projectionMatrix),
            X.projectionMatrixInverse.copy(ne.projectionMatrixInverse);
        else {
          let le = ee + oe,
            R = B + oe,
            I = Z - fe,
            se = J + ($ - fe),
            ae = ((P * B) / R) * le,
            k = ((V * B) / R) * le;
          X.projectionMatrix.makePerspective(I, se, ae, k, le, R),
            X.projectionMatrixInverse.copy(X.projectionMatrix).invert();
        }
      }
      function N(X, ne) {
        ne === null
          ? X.matrixWorld.copy(X.matrix)
          : X.matrixWorld.multiplyMatrices(ne.matrixWorld, X.matrix),
          X.matrixWorldInverse.copy(X.matrixWorld).invert();
      }
      this.updateCamera = function (X) {
        if (s === null) return;
        let ne = X.near,
          re = X.far;
        g.texture !== null &&
          (g.depthNear > 0 && (ne = g.depthNear), g.depthFar > 0 && (re = g.depthFar)),
          (H.near = S.near = w.near = ne),
          (H.far = S.far = w.far = re),
          (O !== H.near || q !== H.far) &&
            (s.updateRenderState({ depthNear: H.near, depthFar: H.far }),
            (O = H.near),
            (q = H.far)),
          (H.layers.mask = X.layers.mask | 6),
          (w.layers.mask = H.layers.mask & 3),
          (S.layers.mask = H.layers.mask & 5);
        let $ = X.parent,
          ue = H.cameras;
        N(H, $);
        for (let me = 0; me < ue.length; me++) N(ue[me], $);
        ue.length === 2 ? j(H, w, S) : H.projectionMatrix.copy(w.projectionMatrix), Q(X, H, $);
      };
      function Q(X, ne, re) {
        re === null
          ? X.matrix.copy(ne.matrixWorld)
          : (X.matrix.copy(re.matrixWorld), X.matrix.invert(), X.matrix.multiply(ne.matrixWorld)),
          X.matrix.decompose(X.position, X.quaternion, X.scale),
          X.updateMatrixWorld(!0),
          X.projectionMatrix.copy(ne.projectionMatrix),
          X.projectionMatrixInverse.copy(ne.projectionMatrixInverse),
          X.isPerspectiveCamera &&
            ((X.fov = T0 * 2 * Math.atan(1 / X.projectionMatrix.elements[5])), (X.zoom = 1));
      }
      (this.getCamera = function () {
        return H;
      }),
        (this.getFoveation = function () {
          if (!(f === null && p === null)) return l;
        }),
        (this.setFoveation = function (X) {
          (l = X),
            f !== null && (f.fixedFoveation = X),
            p !== null && p.fixedFoveation !== void 0 && (p.fixedFoveation = X);
        }),
        (this.hasDepthSensing = function () {
          return g.texture !== null;
        }),
        (this.getDepthSensingMesh = function () {
          return g.getMesh(H);
        }),
        (this.getCameraTexture = function (X) {
          return x[X];
        });
      let K = null;
      function ie(X, ne) {
        if (((u = ne.getViewerPose(c || r)), (d = ne), u !== null)) {
          let re = u.views;
          p !== null && (e.setRenderTargetFramebuffer(m, p.framebuffer), e.setRenderTarget(m));
          let $ = !1;
          re.length !== H.cameras.length && ((H.cameras.length = 0), ($ = !0));
          for (let B = 0; B < re.length; B++) {
            let P = re[B],
              V = null;
            if (p !== null) V = p.getViewport(P);
            else {
              let L = h.getViewSubImage(f, P);
              (V = L.viewport),
                B === 0 &&
                  (e.setRenderTargetTextures(m, L.colorTexture, L.depthStencilTexture),
                  e.setRenderTarget(m));
            }
            let Y = z[B];
            Y === void 0 &&
              ((Y = new Wn()), Y.layers.enable(B), (Y.viewport = new Dt()), (z[B] = Y)),
              Y.matrix.fromArray(P.transform.matrix),
              Y.matrix.decompose(Y.position, Y.quaternion, Y.scale),
              Y.projectionMatrix.fromArray(P.projectionMatrix),
              Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert(),
              Y.viewport.set(V.x, V.y, V.width, V.height),
              B === 0 &&
                (H.matrix.copy(Y.matrix), H.matrix.decompose(H.position, H.quaternion, H.scale)),
              $ === !0 && H.cameras.push(Y);
          }
          let ue = s.enabledFeatures;
          if (ue && ue.includes("depth-sensing") && s.depthUsage == "gpu-optimized" && v) {
            h = n.getBinding();
            let B = h.getDepthInformation(re[0]);
            B && B.isValid && B.texture && g.init(B, s.renderState);
          }
          if (ue && ue.includes("camera-access") && v) {
            e.state.unbindTexture(), (h = n.getBinding());
            for (let B = 0; B < re.length; B++) {
              let P = re[B].camera;
              if (P) {
                let V = x[P];
                V || ((V = new nc()), (x[P] = V));
                let Y = h.getCameraImage(P);
                V.sourceTexture = Y;
              }
            }
          }
        }
        for (let re = 0; re < A.length; re++) {
          let $ = _[re],
            ue = A[re];
          $ !== null && ue !== void 0 && ue.update($, ne, c || r);
        }
        K && K(X, ne),
          ne.detectedPlanes && n.dispatchEvent({ type: "planesdetected", data: ne }),
          (d = null);
      }
      let F = new Ty();
      F.setAnimationLoop(ie),
        (this.setAnimationLoop = function (X) {
          K = X;
        }),
        (this.dispose = function () {});
    }
  },
  el = new In(),
  N6 = new Ye();
function B6(i, e) {
  function t(g, x) {
    g.matrixAutoUpdate === !0 && g.updateMatrix(), x.value.copy(g.matrix);
  }
  function n(g, x) {
    x.color.getRGB(g.fogColor.value, pg(i)),
      x.isFog
        ? ((g.fogNear.value = x.near), (g.fogFar.value = x.far))
        : x.isFogExp2 && (g.fogDensity.value = x.density);
  }
  function s(g, x, y, b, m) {
    x.isMeshBasicMaterial || x.isMeshLambertMaterial
      ? o(g, x)
      : x.isMeshToonMaterial
        ? (o(g, x), h(g, x))
        : x.isMeshPhongMaterial
          ? (o(g, x), u(g, x))
          : x.isMeshStandardMaterial
            ? (o(g, x), f(g, x), x.isMeshPhysicalMaterial && p(g, x, m))
            : x.isMeshMatcapMaterial
              ? (o(g, x), d(g, x))
              : x.isMeshDepthMaterial
                ? o(g, x)
                : x.isMeshDistanceMaterial
                  ? (o(g, x), v(g, x))
                  : x.isMeshNormalMaterial
                    ? o(g, x)
                    : x.isLineBasicMaterial
                      ? (r(g, x), x.isLineDashedMaterial && a(g, x))
                      : x.isPointsMaterial
                        ? l(g, x, y, b)
                        : x.isSpriteMaterial
                          ? c(g, x)
                          : x.isShadowMaterial
                            ? (g.color.value.copy(x.color), (g.opacity.value = x.opacity))
                            : x.isShaderMaterial && (x.uniformsNeedUpdate = !1);
  }
  function o(g, x) {
    (g.opacity.value = x.opacity),
      x.color && g.diffuse.value.copy(x.color),
      x.emissive && g.emissive.value.copy(x.emissive).multiplyScalar(x.emissiveIntensity),
      x.map && ((g.map.value = x.map), t(x.map, g.mapTransform)),
      x.alphaMap && ((g.alphaMap.value = x.alphaMap), t(x.alphaMap, g.alphaMapTransform)),
      x.bumpMap &&
        ((g.bumpMap.value = x.bumpMap),
        t(x.bumpMap, g.bumpMapTransform),
        (g.bumpScale.value = x.bumpScale),
        x.side === Ki && (g.bumpScale.value *= -1)),
      x.normalMap &&
        ((g.normalMap.value = x.normalMap),
        t(x.normalMap, g.normalMapTransform),
        g.normalScale.value.copy(x.normalScale),
        x.side === Ki && g.normalScale.value.negate()),
      x.displacementMap &&
        ((g.displacementMap.value = x.displacementMap),
        t(x.displacementMap, g.displacementMapTransform),
        (g.displacementScale.value = x.displacementScale),
        (g.displacementBias.value = x.displacementBias)),
      x.emissiveMap &&
        ((g.emissiveMap.value = x.emissiveMap), t(x.emissiveMap, g.emissiveMapTransform)),
      x.specularMap &&
        ((g.specularMap.value = x.specularMap), t(x.specularMap, g.specularMapTransform)),
      x.alphaTest > 0 && (g.alphaTest.value = x.alphaTest);
    let y = e.get(x),
      b = y.envMap,
      m = y.envMapRotation;
    b &&
      ((g.envMap.value = b),
      el.copy(m),
      (el.x *= -1),
      (el.y *= -1),
      (el.z *= -1),
      b.isCubeTexture && b.isRenderTargetTexture === !1 && ((el.y *= -1), (el.z *= -1)),
      g.envMapRotation.value.setFromMatrix4(N6.makeRotationFromEuler(el)),
      (g.flipEnvMap.value = b.isCubeTexture && b.isRenderTargetTexture === !1 ? -1 : 1),
      (g.reflectivity.value = x.reflectivity),
      (g.ior.value = x.ior),
      (g.refractionRatio.value = x.refractionRatio)),
      x.lightMap &&
        ((g.lightMap.value = x.lightMap),
        (g.lightMapIntensity.value = x.lightMapIntensity),
        t(x.lightMap, g.lightMapTransform)),
      x.aoMap &&
        ((g.aoMap.value = x.aoMap),
        (g.aoMapIntensity.value = x.aoMapIntensity),
        t(x.aoMap, g.aoMapTransform));
  }
  function r(g, x) {
    g.diffuse.value.copy(x.color),
      (g.opacity.value = x.opacity),
      x.map && ((g.map.value = x.map), t(x.map, g.mapTransform));
  }
  function a(g, x) {
    (g.dashSize.value = x.dashSize),
      (g.totalSize.value = x.dashSize + x.gapSize),
      (g.scale.value = x.scale);
  }
  function l(g, x, y, b) {
    g.diffuse.value.copy(x.color),
      (g.opacity.value = x.opacity),
      (g.size.value = x.size * y),
      (g.scale.value = b * 0.5),
      x.map && ((g.map.value = x.map), t(x.map, g.uvTransform)),
      x.alphaMap && ((g.alphaMap.value = x.alphaMap), t(x.alphaMap, g.alphaMapTransform)),
      x.alphaTest > 0 && (g.alphaTest.value = x.alphaTest);
  }
  function c(g, x) {
    g.diffuse.value.copy(x.color),
      (g.opacity.value = x.opacity),
      (g.rotation.value = x.rotation),
      x.map && ((g.map.value = x.map), t(x.map, g.mapTransform)),
      x.alphaMap && ((g.alphaMap.value = x.alphaMap), t(x.alphaMap, g.alphaMapTransform)),
      x.alphaTest > 0 && (g.alphaTest.value = x.alphaTest);
  }
  function u(g, x) {
    g.specular.value.copy(x.specular), (g.shininess.value = Math.max(x.shininess, 1e-4));
  }
  function h(g, x) {
    x.gradientMap && (g.gradientMap.value = x.gradientMap);
  }
  function f(g, x) {
    (g.metalness.value = x.metalness),
      x.metalnessMap &&
        ((g.metalnessMap.value = x.metalnessMap), t(x.metalnessMap, g.metalnessMapTransform)),
      (g.roughness.value = x.roughness),
      x.roughnessMap &&
        ((g.roughnessMap.value = x.roughnessMap), t(x.roughnessMap, g.roughnessMapTransform)),
      x.envMap && (g.envMapIntensity.value = x.envMapIntensity);
  }
  function p(g, x, y) {
    (g.ior.value = x.ior),
      x.sheen > 0 &&
        (g.sheenColor.value.copy(x.sheenColor).multiplyScalar(x.sheen),
        (g.sheenRoughness.value = x.sheenRoughness),
        x.sheenColorMap &&
          ((g.sheenColorMap.value = x.sheenColorMap),
          t(x.sheenColorMap, g.sheenColorMapTransform)),
        x.sheenRoughnessMap &&
          ((g.sheenRoughnessMap.value = x.sheenRoughnessMap),
          t(x.sheenRoughnessMap, g.sheenRoughnessMapTransform))),
      x.clearcoat > 0 &&
        ((g.clearcoat.value = x.clearcoat),
        (g.clearcoatRoughness.value = x.clearcoatRoughness),
        x.clearcoatMap &&
          ((g.clearcoatMap.value = x.clearcoatMap), t(x.clearcoatMap, g.clearcoatMapTransform)),
        x.clearcoatRoughnessMap &&
          ((g.clearcoatRoughnessMap.value = x.clearcoatRoughnessMap),
          t(x.clearcoatRoughnessMap, g.clearcoatRoughnessMapTransform)),
        x.clearcoatNormalMap &&
          ((g.clearcoatNormalMap.value = x.clearcoatNormalMap),
          t(x.clearcoatNormalMap, g.clearcoatNormalMapTransform),
          g.clearcoatNormalScale.value.copy(x.clearcoatNormalScale),
          x.side === Ki && g.clearcoatNormalScale.value.negate())),
      x.dispersion > 0 && (g.dispersion.value = x.dispersion),
      x.iridescence > 0 &&
        ((g.iridescence.value = x.iridescence),
        (g.iridescenceIOR.value = x.iridescenceIOR),
        (g.iridescenceThicknessMinimum.value = x.iridescenceThicknessRange[0]),
        (g.iridescenceThicknessMaximum.value = x.iridescenceThicknessRange[1]),
        x.iridescenceMap &&
          ((g.iridescenceMap.value = x.iridescenceMap),
          t(x.iridescenceMap, g.iridescenceMapTransform)),
        x.iridescenceThicknessMap &&
          ((g.iridescenceThicknessMap.value = x.iridescenceThicknessMap),
          t(x.iridescenceThicknessMap, g.iridescenceThicknessMapTransform))),
      x.transmission > 0 &&
        ((g.transmission.value = x.transmission),
        (g.transmissionSamplerMap.value = y.texture),
        g.transmissionSamplerSize.value.set(y.width, y.height),
        x.transmissionMap &&
          ((g.transmissionMap.value = x.transmissionMap),
          t(x.transmissionMap, g.transmissionMapTransform)),
        (g.thickness.value = x.thickness),
        x.thicknessMap &&
          ((g.thicknessMap.value = x.thicknessMap), t(x.thicknessMap, g.thicknessMapTransform)),
        (g.attenuationDistance.value = x.attenuationDistance),
        g.attenuationColor.value.copy(x.attenuationColor)),
      x.anisotropy > 0 &&
        (g.anisotropyVector.value.set(
          x.anisotropy * Math.cos(x.anisotropyRotation),
          x.anisotropy * Math.sin(x.anisotropyRotation),
        ),
        x.anisotropyMap &&
          ((g.anisotropyMap.value = x.anisotropyMap),
          t(x.anisotropyMap, g.anisotropyMapTransform))),
      (g.specularIntensity.value = x.specularIntensity),
      g.specularColor.value.copy(x.specularColor),
      x.specularColorMap &&
        ((g.specularColorMap.value = x.specularColorMap),
        t(x.specularColorMap, g.specularColorMapTransform)),
      x.specularIntensityMap &&
        ((g.specularIntensityMap.value = x.specularIntensityMap),
        t(x.specularIntensityMap, g.specularIntensityMapTransform));
  }
  function d(g, x) {
    x.matcap && (g.matcap.value = x.matcap);
  }
  function v(g, x) {
    let y = e.get(x).light;
    g.referencePosition.value.setFromMatrixPosition(y.matrixWorld),
      (g.nearDistance.value = y.shadow.camera.near),
      (g.farDistance.value = y.shadow.camera.far);
  }
  return { refreshFogUniforms: n, refreshMaterialUniforms: s };
}
function O6(i, e, t, n) {
  let s = {},
    o = {},
    r = [],
    a = i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);
  function l(y, b) {
    let m = b.program;
    n.uniformBlockBinding(y, m);
  }
  function c(y, b) {
    let m = s[y.id];
    m === void 0 && (d(y), (m = u(y)), (s[y.id] = m), y.addEventListener("dispose", g));
    let A = b.program;
    n.updateUBOMapping(y, A);
    let _ = e.render.frame;
    o[y.id] !== _ && (f(y), (o[y.id] = _));
  }
  function u(y) {
    let b = h();
    y.__bindingPointIndex = b;
    let m = i.createBuffer(),
      A = y.__size,
      _ = y.usage;
    return (
      i.bindBuffer(i.UNIFORM_BUFFER, m),
      i.bufferData(i.UNIFORM_BUFFER, A, _),
      i.bindBuffer(i.UNIFORM_BUFFER, null),
      i.bindBufferBase(i.UNIFORM_BUFFER, b, m),
      m
    );
  }
  function h() {
    for (let y = 0; y < a; y++) if (r.indexOf(y) === -1) return r.push(y), y;
    return (
      console.error(
        "THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.",
      ),
      0
    );
  }
  function f(y) {
    let b = s[y.id],
      m = y.uniforms,
      A = y.__cache;
    i.bindBuffer(i.UNIFORM_BUFFER, b);
    for (let _ = 0, M = m.length; _ < M; _++) {
      let E = Array.isArray(m[_]) ? m[_] : [m[_]];
      for (let w = 0, S = E.length; w < S; w++) {
        let z = E[w];
        if (p(z, _, w, A) === !0) {
          let H = z.__offset,
            O = Array.isArray(z.value) ? z.value : [z.value],
            q = 0;
          for (let U = 0; U < O.length; U++) {
            let T = O[U],
              D = v(T);
            typeof T == "number" || typeof T == "boolean"
              ? ((z.__data[0] = T), i.bufferSubData(i.UNIFORM_BUFFER, H + q, z.__data))
              : T.isMatrix3
                ? ((z.__data[0] = T.elements[0]),
                  (z.__data[1] = T.elements[1]),
                  (z.__data[2] = T.elements[2]),
                  (z.__data[3] = 0),
                  (z.__data[4] = T.elements[3]),
                  (z.__data[5] = T.elements[4]),
                  (z.__data[6] = T.elements[5]),
                  (z.__data[7] = 0),
                  (z.__data[8] = T.elements[6]),
                  (z.__data[9] = T.elements[7]),
                  (z.__data[10] = T.elements[8]),
                  (z.__data[11] = 0))
                : (T.toArray(z.__data, q), (q += D.storage / Float32Array.BYTES_PER_ELEMENT));
          }
          i.bufferSubData(i.UNIFORM_BUFFER, H, z.__data);
        }
      }
    }
    i.bindBuffer(i.UNIFORM_BUFFER, null);
  }
  function p(y, b, m, A) {
    let _ = y.value,
      M = b + "_" + m;
    if (A[M] === void 0)
      return typeof _ == "number" || typeof _ == "boolean" ? (A[M] = _) : (A[M] = _.clone()), !0;
    {
      let E = A[M];
      if (typeof _ == "number" || typeof _ == "boolean") {
        if (E !== _) return (A[M] = _), !0;
      } else if (E.equals(_) === !1) return E.copy(_), !0;
    }
    return !1;
  }
  function d(y) {
    let b = y.uniforms,
      m = 0,
      A = 16;
    for (let M = 0, E = b.length; M < E; M++) {
      let w = Array.isArray(b[M]) ? b[M] : [b[M]];
      for (let S = 0, z = w.length; S < z; S++) {
        let H = w[S],
          O = Array.isArray(H.value) ? H.value : [H.value];
        for (let q = 0, U = O.length; q < U; q++) {
          let T = O[q],
            D = v(T),
            C = m % A,
            G = C % D.boundary,
            j = C + G;
          (m += G),
            j !== 0 && A - j < D.storage && (m += A - j),
            (H.__data = new Float32Array(D.storage / Float32Array.BYTES_PER_ELEMENT)),
            (H.__offset = m),
            (m += D.storage);
        }
      }
    }
    let _ = m % A;
    return _ > 0 && (m += A - _), (y.__size = m), (y.__cache = {}), this;
  }
  function v(y) {
    let b = { boundary: 0, storage: 0 };
    return (
      typeof y == "number" || typeof y == "boolean"
        ? ((b.boundary = 4), (b.storage = 4))
        : y.isVector2
          ? ((b.boundary = 8), (b.storage = 8))
          : y.isVector3 || y.isColor
            ? ((b.boundary = 16), (b.storage = 12))
            : y.isVector4
              ? ((b.boundary = 16), (b.storage = 16))
              : y.isMatrix3
                ? ((b.boundary = 48), (b.storage = 48))
                : y.isMatrix4
                  ? ((b.boundary = 64), (b.storage = 64))
                  : y.isTexture
                    ? console.warn(
                        "THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.",
                      )
                    : console.warn("THREE.WebGLRenderer: Unsupported uniform value type.", y),
      b
    );
  }
  function g(y) {
    let b = y.target;
    b.removeEventListener("dispose", g);
    let m = r.indexOf(b.__bindingPointIndex);
    r.splice(m, 1), i.deleteBuffer(s[b.id]), delete s[b.id], delete o[b.id];
  }
  function x() {
    for (let y in s) i.deleteBuffer(s[y]);
    (r = []), (s = {}), (o = {});
  }
  return { bind: l, update: c, dispose: x };
}
var gf = class {
  constructor(e = {}) {
    let {
      canvas: t = dg(),
      context: n = null,
      depth: s = !0,
      stencil: o = !1,
      alpha: r = !1,
      antialias: a = !1,
      premultipliedAlpha: l = !0,
      preserveDrawingBuffer: c = !1,
      powerPreference: u = "default",
      failIfMajorPerformanceCaveat: h = !1,
      reversedDepthBuffer: f = !1,
    } = e;
    this.isWebGLRenderer = !0;
    let p;
    if (n !== null) {
      if (typeof WebGLRenderingContext < "u" && n instanceof WebGLRenderingContext)
        throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");
      p = n.getContextAttributes().alpha;
    } else p = r;
    let d = new Uint32Array(4),
      v = new Int32Array(4),
      g = null,
      x = null,
      y = [],
      b = [];
    (this.domElement = t),
      (this.debug = { checkShaderErrors: !0, onShaderError: null }),
      (this.autoClear = !0),
      (this.autoClearColor = !0),
      (this.autoClearDepth = !0),
      (this.autoClearStencil = !0),
      (this.sortObjects = !0),
      (this.clippingPlanes = []),
      (this.localClippingEnabled = !1),
      (this.toneMapping = ys),
      (this.toneMappingExposure = 1),
      (this.transmissionResolutionScale = 1);
    let m = this,
      A = !1;
    this._outputColorSpace = Vn;
    let _ = 0,
      M = 0,
      E = null,
      w = -1,
      S = null,
      z = new Dt(),
      H = new Dt(),
      O = null,
      q = new Ve(0),
      U = 0,
      T = t.width,
      D = t.height,
      C = 1,
      G = null,
      j = null,
      N = new Dt(0, 0, T, D),
      Q = new Dt(0, 0, T, D),
      K = !1,
      ie = new Zr(),
      F = !1,
      X = !1,
      ne = new Ye(),
      re = new W(),
      $ = new Dt(),
      ue = {
        background: null,
        fog: null,
        environment: null,
        overrideMaterial: null,
        isScene: !0,
      },
      me = !1;
    function ee() {
      return E === null ? C : 1;
    }
    let B = n;
    function P(de, te) {
      return t.getContext(de, te);
    }
    try {
      let de = {
        alpha: !0,
        depth: s,
        stencil: o,
        antialias: a,
        premultipliedAlpha: l,
        preserveDrawingBuffer: c,
        powerPreference: u,
        failIfMajorPerformanceCaveat: h,
      };
      if (
        ("setAttribute" in t && t.setAttribute("data-engine", `three.js r${"180"}`),
        t.addEventListener("webglcontextlost", Be, !1),
        t.addEventListener("webglcontextrestored", Xe, !1),
        t.addEventListener("webglcontextcreationerror", Me, !1),
        B === null)
      ) {
        let te = "webgl2";
        if (((B = P(te, de)), B === null))
          throw P(te)
            ? new Error("Error creating WebGL context with your selected attributes.")
            : new Error("Error creating WebGL context.");
      }
    } catch (de) {
      throw (console.error("THREE.WebGLRenderer: " + de.message), de);
    }
    let V, Y, L, Z, J, oe, fe, le, R, I, se, ae, k, ce, ve, _e, Te, Pe, Re, Fe, ze, We, Ne, dt;
    function xe() {
      (V = new oT(B)),
        V.init(),
        (We = new Iy(B, V)),
        (Y = new KS(B, V, e, We)),
        (L = new L6(B, V)),
        Y.reversedDepthBuffer && f && L.buffers.depth.setReversed(!0),
        (Z = new lT(B)),
        (J = new _6()),
        (oe = new k6(B, V, L, J, Y, We, Z)),
        (fe = new eT(m)),
        (le = new sT(m)),
        (R = new p4(B)),
        (Ne = new jS(B, R)),
        (I = new rT(B, R, Z, Ne)),
        (se = new uT(B, I, R, Z)),
        (Re = new cT(B, Y, oe)),
        (_e = new QS(J)),
        (ae = new b6(m, fe, le, V, Y, Ne, _e)),
        (k = new B6(m, J)),
        (ce = new w6()),
        (ve = new C6(V)),
        (Pe = new ZS(m, fe, le, L, se, p, l)),
        (Te = new z6(m, se, Y)),
        (dt = new O6(B, Z, Y, L)),
        (Fe = new JS(B, V, Z)),
        (ze = new aT(B, V, Z)),
        (Z.programs = ae.programs),
        (m.capabilities = Y),
        (m.extensions = V),
        (m.properties = J),
        (m.renderLists = ce),
        (m.shadowMap = Te),
        (m.state = L),
        (m.info = Z);
    }
    xe();
    let Ie = new Lg(m, B);
    (this.xr = Ie),
      (this.getContext = function () {
        return B;
      }),
      (this.getContextAttributes = function () {
        return B.getContextAttributes();
      }),
      (this.forceContextLoss = function () {
        let de = V.get("WEBGL_lose_context");
        de && de.loseContext();
      }),
      (this.forceContextRestore = function () {
        let de = V.get("WEBGL_lose_context");
        de && de.restoreContext();
      }),
      (this.getPixelRatio = function () {
        return C;
      }),
      (this.setPixelRatio = function (de) {
        de !== void 0 && ((C = de), this.setSize(T, D, !1));
      }),
      (this.getSize = function (de) {
        return de.set(T, D);
      }),
      (this.setSize = function (de, te, he = !0) {
        if (Ie.isPresenting) {
          console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");
          return;
        }
        (T = de),
          (D = te),
          (t.width = Math.floor(de * C)),
          (t.height = Math.floor(te * C)),
          he === !0 && ((t.style.width = de + "px"), (t.style.height = te + "px")),
          this.setViewport(0, 0, de, te);
      }),
      (this.getDrawingBufferSize = function (de) {
        return de.set(T * C, D * C).floor();
      }),
      (this.setDrawingBufferSize = function (de, te, he) {
        (T = de),
          (D = te),
          (C = he),
          (t.width = Math.floor(de * he)),
          (t.height = Math.floor(te * he)),
          this.setViewport(0, 0, de, te);
      }),
      (this.getCurrentViewport = function (de) {
        return de.copy(z);
      }),
      (this.getViewport = function (de) {
        return de.copy(N);
      }),
      (this.setViewport = function (de, te, he, pe) {
        de.isVector4 ? N.set(de.x, de.y, de.z, de.w) : N.set(de, te, he, pe),
          L.viewport(z.copy(N).multiplyScalar(C).round());
      }),
      (this.getScissor = function (de) {
        return de.copy(Q);
      }),
      (this.setScissor = function (de, te, he, pe) {
        de.isVector4 ? Q.set(de.x, de.y, de.z, de.w) : Q.set(de, te, he, pe),
          L.scissor(H.copy(Q).multiplyScalar(C).round());
      }),
      (this.getScissorTest = function () {
        return K;
      }),
      (this.setScissorTest = function (de) {
        L.setScissorTest((K = de));
      }),
      (this.setOpaqueSort = function (de) {
        G = de;
      }),
      (this.setTransparentSort = function (de) {
        j = de;
      }),
      (this.getClearColor = function (de) {
        return de.copy(Pe.getClearColor());
      }),
      (this.setClearColor = function () {
        Pe.setClearColor(...arguments);
      }),
      (this.getClearAlpha = function () {
        return Pe.getClearAlpha();
      }),
      (this.setClearAlpha = function () {
        Pe.setClearAlpha(...arguments);
      }),
      (this.clear = function (de = !0, te = !0, he = !0) {
        let pe = 0;
        if (de) {
          let ge = !1;
          if (E !== null) {
            let ye = E.texture.format;
            ge = ye === Nh || ye === Uh || ye === Mc;
          }
          if (ge) {
            let ye = E.texture.type,
              Le = ye === yi || ye === Zs || ye === $0 || ye === Z0 || ye === kh || ye === Fh,
              ke = Pe.getClearColor(),
              Ue = Pe.getClearAlpha(),
              ct = ke.r,
              De = ke.g,
              it = ke.b;
            Le
              ? ((d[0] = ct),
                (d[1] = De),
                (d[2] = it),
                (d[3] = Ue),
                B.clearBufferuiv(B.COLOR, 0, d))
              : ((v[0] = ct),
                (v[1] = De),
                (v[2] = it),
                (v[3] = Ue),
                B.clearBufferiv(B.COLOR, 0, v));
          } else pe |= B.COLOR_BUFFER_BIT;
        }
        te && (pe |= B.DEPTH_BUFFER_BIT),
          he && ((pe |= B.STENCIL_BUFFER_BIT), this.state.buffers.stencil.setMask(4294967295)),
          B.clear(pe);
      }),
      (this.clearColor = function () {
        this.clear(!0, !1, !1);
      }),
      (this.clearDepth = function () {
        this.clear(!1, !0, !1);
      }),
      (this.clearStencil = function () {
        this.clear(!1, !1, !0);
      }),
      (this.dispose = function () {
        t.removeEventListener("webglcontextlost", Be, !1),
          t.removeEventListener("webglcontextrestored", Xe, !1),
          t.removeEventListener("webglcontextcreationerror", Me, !1),
          Pe.dispose(),
          ce.dispose(),
          ve.dispose(),
          J.dispose(),
          fe.dispose(),
          le.dispose(),
          se.dispose(),
          Ne.dispose(),
          dt.dispose(),
          ae.dispose(),
          Ie.dispose(),
          Ie.removeEventListener("sessionstart", bt),
          Ie.removeEventListener("sessionend", Os),
          pn.stop();
      });
    function Be(de) {
      de.preventDefault(), console.log("THREE.WebGLRenderer: Context Lost."), (A = !0);
    }
    function Xe() {
      console.log("THREE.WebGLRenderer: Context Restored."), (A = !1);
      let de = Z.autoReset,
        te = Te.enabled,
        he = Te.autoUpdate,
        pe = Te.needsUpdate,
        ge = Te.type;
      xe(),
        (Z.autoReset = de),
        (Te.enabled = te),
        (Te.autoUpdate = he),
        (Te.needsUpdate = pe),
        (Te.type = ge);
    }
    function Me(de) {
      console.error(
        "THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",
        de.statusMessage,
      );
    }
    function we(de) {
      let te = de.target;
      te.removeEventListener("dispose", we), be(te);
    }
    function be(de) {
      Oe(de), J.remove(de);
    }
    function Oe(de) {
      let te = J.get(de).programs;
      te !== void 0 &&
        (te.forEach(function (he) {
          ae.releaseProgram(he);
        }),
        de.isShaderMaterial && ae.releaseShaderCache(de));
    }
    this.renderBufferDirect = function (de, te, he, pe, ge, ye) {
      te === null && (te = ue);
      let Le = ge.isMesh && ge.matrixWorld.determinant() < 0,
        ke = Hn(de, te, he, pe, ge);
      L.setMaterial(pe, Le);
      let Ue = he.index,
        ct = 1;
      if (pe.wireframe === !0) {
        if (((Ue = I.getWireframeAttribute(he)), Ue === void 0)) return;
        ct = 2;
      }
      let De = he.drawRange,
        it = he.attributes.position,
        gt = De.start * ct,
        Ot = (De.start + De.count) * ct;
      ye !== null &&
        ((gt = Math.max(gt, ye.start * ct)), (Ot = Math.min(Ot, (ye.start + ye.count) * ct))),
        Ue !== null
          ? ((gt = Math.max(gt, 0)), (Ot = Math.min(Ot, Ue.count)))
          : it != null && ((gt = Math.max(gt, 0)), (Ot = Math.min(Ot, it.count)));
      let xn = Ot - gt;
      if (xn < 0 || xn === 1 / 0) return;
      Ne.setup(ge, pe, ke, he, Ue);
      let $t,
        Ht = Fe;
      if ((Ue !== null && (($t = R.get(Ue)), (Ht = ze), Ht.setIndex($t)), ge.isMesh))
        pe.wireframe === !0
          ? (L.setLineWidth(pe.wireframeLinewidth * ee()), Ht.setMode(B.LINES))
          : Ht.setMode(B.TRIANGLES);
      else if (ge.isLine) {
        let Je = pe.linewidth;
        Je === void 0 && (Je = 1),
          L.setLineWidth(Je * ee()),
          ge.isLineSegments
            ? Ht.setMode(B.LINES)
            : ge.isLineLoop
              ? Ht.setMode(B.LINE_LOOP)
              : Ht.setMode(B.LINE_STRIP);
      } else ge.isPoints ? Ht.setMode(B.POINTS) : ge.isSprite && Ht.setMode(B.TRIANGLES);
      if (ge.isBatchedMesh)
        if (ge._multiDrawInstances !== null)
          jl(
            "THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection.",
          ),
            Ht.renderMultiDrawInstances(
              ge._multiDrawStarts,
              ge._multiDrawCounts,
              ge._multiDrawCount,
              ge._multiDrawInstances,
            );
        else if (V.get("WEBGL_multi_draw"))
          Ht.renderMultiDraw(ge._multiDrawStarts, ge._multiDrawCounts, ge._multiDrawCount);
        else {
          let Je = ge._multiDrawStarts,
            Pt = ge._multiDrawCounts,
            Vt = ge._multiDrawCount,
            ss = Ue ? R.get(Ue).bytesPerElement : 1,
            Hs = J.get(pe).currentProgram.getUniforms();
          for (let Tt = 0; Tt < Vt; Tt++)
            Hs.setValue(B, "_gl_DrawID", Tt), Ht.render(Je[Tt] / ss, Pt[Tt]);
        }
      else if (ge.isInstancedMesh) Ht.renderInstances(gt, xn, ge.count);
      else if (he.isInstancedBufferGeometry) {
        let Je = he._maxInstanceCount !== void 0 ? he._maxInstanceCount : 1 / 0,
          Pt = Math.min(he.instanceCount, Je);
        Ht.renderInstances(gt, xn, Pt);
      } else Ht.render(gt, xn);
    };
    function pt(de, te, he) {
      de.transparent === !0 && de.side === Sn && de.forceSinglePass === !1
        ? ((de.side = Ki),
          (de.needsUpdate = !0),
          $i(de, te, he),
          (de.side = wr),
          (de.needsUpdate = !0),
          $i(de, te, he),
          (de.side = Sn))
        : $i(de, te, he);
    }
    (this.compile = function (de, te, he = null) {
      he === null && (he = de),
        (x = ve.get(he)),
        x.init(te),
        b.push(x),
        he.traverseVisible(function (ge) {
          ge.isLight &&
            ge.layers.test(te.layers) &&
            (x.pushLight(ge), ge.castShadow && x.pushShadow(ge));
        }),
        de !== he &&
          de.traverseVisible(function (ge) {
            ge.isLight &&
              ge.layers.test(te.layers) &&
              (x.pushLight(ge), ge.castShadow && x.pushShadow(ge));
          }),
        x.setupLights();
      let pe = new Set();
      return (
        de.traverse(function (ge) {
          if (!(ge.isMesh || ge.isPoints || ge.isLine || ge.isSprite)) return;
          let ye = ge.material;
          if (ye)
            if (Array.isArray(ye))
              for (let Le = 0; Le < ye.length; Le++) {
                let ke = ye[Le];
                pt(ke, he, ge), pe.add(ke);
              }
            else pt(ye, he, ge), pe.add(ye);
        }),
        (x = b.pop()),
        pe
      );
    }),
      (this.compileAsync = function (de, te, he = null) {
        let pe = this.compile(de, te, he);
        return new Promise((ge) => {
          function ye() {
            if (
              (pe.forEach(function (Le) {
                J.get(Le).currentProgram.isReady() && pe.delete(Le);
              }),
              pe.size === 0)
            ) {
              ge(de);
              return;
            }
            setTimeout(ye, 10);
          }
          V.get("KHR_parallel_shader_compile") !== null ? ye() : setTimeout(ye, 10);
        });
      });
    let ut = null;
    function nn(de) {
      ut && ut(de);
    }
    function bt() {
      pn.stop();
    }
    function Os() {
      pn.start();
    }
    let pn = new Ty();
    pn.setAnimationLoop(nn),
      typeof self < "u" && pn.setContext(self),
      (this.setAnimationLoop = function (de) {
        (ut = de), Ie.setAnimationLoop(de), de === null ? pn.stop() : pn.start();
      }),
      Ie.addEventListener("sessionstart", bt),
      Ie.addEventListener("sessionend", Os),
      (this.render = function (de, te) {
        if (te !== void 0 && te.isCamera !== !0) {
          console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");
          return;
        }
        if (A === !0) return;
        if (
          (de.matrixWorldAutoUpdate === !0 && de.updateMatrixWorld(),
          te.parent === null && te.matrixWorldAutoUpdate === !0 && te.updateMatrixWorld(),
          Ie.enabled === !0 &&
            Ie.isPresenting === !0 &&
            (Ie.cameraAutoUpdate === !0 && Ie.updateCamera(te), (te = Ie.getCamera())),
          de.isScene === !0 && de.onBeforeRender(m, de, te, E),
          (x = ve.get(de, b.length)),
          x.init(te),
          b.push(x),
          ne.multiplyMatrices(te.projectionMatrix, te.matrixWorldInverse),
          ie.setFromProjectionMatrix(ne, qs, te.reversedDepth),
          (X = this.localClippingEnabled),
          (F = _e.init(this.clippingPlanes, X)),
          (g = ce.get(de, y.length)),
          g.init(),
          y.push(g),
          Ie.enabled === !0 && Ie.isPresenting === !0)
        ) {
          let ye = m.xr.getDepthSensingMesh();
          ye !== null && Ti(ye, te, -1 / 0, m.sortObjects);
        }
        Ti(de, te, 0, m.sortObjects),
          g.finish(),
          m.sortObjects === !0 && g.sort(G, j),
          (me = Ie.enabled === !1 || Ie.isPresenting === !1 || Ie.hasDepthSensing() === !1),
          me && Pe.addToRenderList(g, de),
          this.info.render.frame++,
          F === !0 && _e.beginShadows();
        let he = x.state.shadowsArray;
        Te.render(he, de, te),
          F === !0 && _e.endShadows(),
          this.info.autoReset === !0 && this.info.reset();
        let pe = g.opaque,
          ge = g.transmissive;
        if ((x.setupLights(), te.isArrayCamera)) {
          let ye = te.cameras;
          if (ge.length > 0)
            for (let Le = 0, ke = ye.length; Le < ke; Le++) {
              let Ue = ye[Le];
              Rs(pe, ge, de, Ue);
            }
          me && Pe.render(de);
          for (let Le = 0, ke = ye.length; Le < ke; Le++) {
            let Ue = ye[Le];
            ho(g, de, Ue, Ue.viewport);
          }
        } else ge.length > 0 && Rs(pe, ge, de, te), me && Pe.render(de), ho(g, de, te);
        E !== null &&
          M === 0 &&
          (oe.updateMultisampleRenderTarget(E), oe.updateRenderTargetMipmap(E)),
          de.isScene === !0 && de.onAfterRender(m, de, te),
          Ne.resetDefaultState(),
          (w = -1),
          (S = null),
          b.pop(),
          b.length > 0
            ? ((x = b[b.length - 1]),
              F === !0 && _e.setGlobalState(m.clippingPlanes, x.state.camera))
            : (x = null),
          y.pop(),
          y.length > 0 ? (g = y[y.length - 1]) : (g = null);
      });
    function Ti(de, te, he, pe) {
      if (de.visible === !1) return;
      if (de.layers.test(te.layers)) {
        if (de.isGroup) he = de.renderOrder;
        else if (de.isLOD) de.autoUpdate === !0 && de.update(te);
        else if (de.isLight) x.pushLight(de), de.castShadow && x.pushShadow(de);
        else if (de.isSprite) {
          if (!de.frustumCulled || ie.intersectsSprite(de)) {
            pe && $.setFromMatrixPosition(de.matrixWorld).applyMatrix4(ne);
            let Le = se.update(de),
              ke = de.material;
            ke.visible && g.push(de, Le, ke, he, $.z, null);
          }
        } else if (
          (de.isMesh || de.isLine || de.isPoints) &&
          (!de.frustumCulled || ie.intersectsObject(de))
        ) {
          let Le = se.update(de),
            ke = de.material;
          if (
            (pe &&
              (de.boundingSphere !== void 0
                ? (de.boundingSphere === null && de.computeBoundingSphere(),
                  $.copy(de.boundingSphere.center))
                : (Le.boundingSphere === null && Le.computeBoundingSphere(),
                  $.copy(Le.boundingSphere.center)),
              $.applyMatrix4(de.matrixWorld).applyMatrix4(ne)),
            Array.isArray(ke))
          ) {
            let Ue = Le.groups;
            for (let ct = 0, De = Ue.length; ct < De; ct++) {
              let it = Ue[ct],
                gt = ke[it.materialIndex];
              gt && gt.visible && g.push(de, Le, gt, he, $.z, it);
            }
          } else ke.visible && g.push(de, Le, ke, he, $.z, null);
        }
      }
      let ye = de.children;
      for (let Le = 0, ke = ye.length; Le < ke; Le++) Ti(ye[Le], te, he, pe);
    }
    function ho(de, te, he, pe) {
      let ge = de.opaque,
        ye = de.transmissive,
        Le = de.transparent;
      x.setupLightsView(he),
        F === !0 && _e.setGlobalState(m.clippingPlanes, he),
        pe && L.viewport(z.copy(pe)),
        ge.length > 0 && Un(ge, te, he),
        ye.length > 0 && Un(ye, te, he),
        Le.length > 0 && Un(Le, te, he),
        L.buffers.depth.setTest(!0),
        L.buffers.depth.setMask(!0),
        L.buffers.color.setMask(!0),
        L.setPolygonOffset(!1);
    }
    function Rs(de, te, he, pe) {
      if ((he.isScene === !0 ? he.overrideMaterial : null) !== null) return;
      x.state.transmissionRenderTarget[pe.id] === void 0 &&
        (x.state.transmissionRenderTarget[pe.id] = new si(1, 1, {
          generateMipmaps: !0,
          type: V.has("EXT_color_buffer_half_float") || V.has("EXT_color_buffer_float") ? js : yi,
          minFilter: Ln,
          samples: 4,
          stencilBuffer: o,
          resolveDepthBuffer: !1,
          resolveStencilBuffer: !1,
          colorSpace: Kt.workingColorSpace,
        }));
      let ye = x.state.transmissionRenderTarget[pe.id],
        Le = pe.viewport || z;
      ye.setSize(Le.z * m.transmissionResolutionScale, Le.w * m.transmissionResolutionScale);
      let ke = m.getRenderTarget(),
        Ue = m.getActiveCubeFace(),
        ct = m.getActiveMipmapLevel();
      m.setRenderTarget(ye),
        m.getClearColor(q),
        (U = m.getClearAlpha()),
        U < 1 && m.setClearColor(16777215, 0.5),
        m.clear(),
        me && Pe.render(he);
      let De = m.toneMapping;
      m.toneMapping = ys;
      let it = pe.viewport;
      if (
        (pe.viewport !== void 0 && (pe.viewport = void 0),
        x.setupLightsView(pe),
        F === !0 && _e.setGlobalState(m.clippingPlanes, pe),
        Un(de, he, pe),
        oe.updateMultisampleRenderTarget(ye),
        oe.updateRenderTargetMipmap(ye),
        V.has("WEBGL_multisampled_render_to_texture") === !1)
      ) {
        let gt = !1;
        for (let Ot = 0, xn = te.length; Ot < xn; Ot++) {
          let $t = te[Ot],
            Ht = $t.object,
            Je = $t.geometry,
            Pt = $t.material,
            Vt = $t.group;
          if (Pt.side === Sn && Ht.layers.test(pe.layers)) {
            let ss = Pt.side;
            (Pt.side = Ki),
              (Pt.needsUpdate = !0),
              zo(Ht, he, pe, Je, Pt, Vt),
              (Pt.side = ss),
              (Pt.needsUpdate = !0),
              (gt = !0);
          }
        }
        gt === !0 && (oe.updateMultisampleRenderTarget(ye), oe.updateRenderTargetMipmap(ye));
      }
      m.setRenderTarget(ke, Ue, ct),
        m.setClearColor(q, U),
        it !== void 0 && (pe.viewport = it),
        (m.toneMapping = De);
    }
    function Un(de, te, he) {
      let pe = te.isScene === !0 ? te.overrideMaterial : null;
      for (let ge = 0, ye = de.length; ge < ye; ge++) {
        let Le = de[ge],
          ke = Le.object,
          Ue = Le.geometry,
          ct = Le.group,
          De = Le.material;
        De.allowOverride === !0 && pe !== null && (De = pe),
          ke.layers.test(he.layers) && zo(ke, te, he, Ue, De, ct);
      }
    }
    function zo(de, te, he, pe, ge, ye) {
      de.onBeforeRender(m, te, he, pe, ge, ye),
        de.modelViewMatrix.multiplyMatrices(he.matrixWorldInverse, de.matrixWorld),
        de.normalMatrix.getNormalMatrix(de.modelViewMatrix),
        ge.onBeforeRender(m, te, he, pe, de, ye),
        ge.transparent === !0 && ge.side === Sn && ge.forceSinglePass === !1
          ? ((ge.side = Ki),
            (ge.needsUpdate = !0),
            m.renderBufferDirect(he, te, pe, ge, de, ye),
            (ge.side = wr),
            (ge.needsUpdate = !0),
            m.renderBufferDirect(he, te, pe, ge, de, ye),
            (ge.side = Sn))
          : m.renderBufferDirect(he, te, pe, ge, de, ye),
        de.onAfterRender(m, te, he, pe, ge, ye);
    }
    function $i(de, te, he) {
      te.isScene !== !0 && (te = ue);
      let pe = J.get(de),
        ge = x.state.lights,
        ye = x.state.shadowsArray,
        Le = ge.state.version,
        ke = ae.getParameters(de, ge.state, ye, te, he),
        Ue = ae.getProgramCacheKey(ke),
        ct = pe.programs;
      (pe.environment = de.isMeshStandardMaterial ? te.environment : null),
        (pe.fog = te.fog),
        (pe.envMap = (de.isMeshStandardMaterial ? le : fe).get(de.envMap || pe.environment)),
        (pe.envMapRotation =
          pe.environment !== null && de.envMap === null
            ? te.environmentRotation
            : de.envMapRotation),
        ct === void 0 &&
          (de.addEventListener("dispose", we), (ct = new Map()), (pe.programs = ct));
      let De = ct.get(Ue);
      if (De !== void 0) {
        if (pe.currentProgram === De && pe.lightsStateVersion === Le) return ba(de, ke), De;
      } else
        (ke.uniforms = ae.getUniforms(de)),
          de.onBeforeCompile(ke, m),
          (De = ae.acquireProgram(ke, Ue)),
          ct.set(Ue, De),
          (pe.uniforms = ke.uniforms);
      let it = pe.uniforms;
      return (
        ((!de.isShaderMaterial && !de.isRawShaderMaterial) || de.clipping === !0) &&
          (it.clippingPlanes = _e.uniform),
        ba(de, ke),
        (pe.needsLights = ln(de)),
        (pe.lightsStateVersion = Le),
        pe.needsLights &&
          ((it.ambientLightColor.value = ge.state.ambient),
          (it.lightProbe.value = ge.state.probe),
          (it.directionalLights.value = ge.state.directional),
          (it.directionalLightShadows.value = ge.state.directionalShadow),
          (it.spotLights.value = ge.state.spot),
          (it.spotLightShadows.value = ge.state.spotShadow),
          (it.rectAreaLights.value = ge.state.rectArea),
          (it.ltc_1.value = ge.state.rectAreaLTC1),
          (it.ltc_2.value = ge.state.rectAreaLTC2),
          (it.pointLights.value = ge.state.point),
          (it.pointLightShadows.value = ge.state.pointShadow),
          (it.hemisphereLights.value = ge.state.hemi),
          (it.directionalShadowMap.value = ge.state.directionalShadowMap),
          (it.directionalShadowMatrix.value = ge.state.directionalShadowMatrix),
          (it.spotShadowMap.value = ge.state.spotShadowMap),
          (it.spotLightMatrix.value = ge.state.spotLightMatrix),
          (it.spotLightMap.value = ge.state.spotLightMap),
          (it.pointShadowMap.value = ge.state.pointShadowMap),
          (it.pointShadowMatrix.value = ge.state.pointShadowMatrix)),
        (pe.currentProgram = De),
        (pe.uniformsList = null),
        De
      );
    }
    function ya(de) {
      if (de.uniformsList === null) {
        let te = de.currentProgram.getUniforms();
        de.uniformsList = Pc.seqWithValue(te.seq, de.uniforms);
      }
      return de.uniformsList;
    }
    function ba(de, te) {
      let he = J.get(de);
      (he.outputColorSpace = te.outputColorSpace),
        (he.batching = te.batching),
        (he.batchingColor = te.batchingColor),
        (he.instancing = te.instancing),
        (he.instancingColor = te.instancingColor),
        (he.instancingMorph = te.instancingMorph),
        (he.skinning = te.skinning),
        (he.morphTargets = te.morphTargets),
        (he.morphNormals = te.morphNormals),
        (he.morphColors = te.morphColors),
        (he.morphTargetsCount = te.morphTargetsCount),
        (he.numClippingPlanes = te.numClippingPlanes),
        (he.numIntersection = te.numClipIntersection),
        (he.vertexAlphas = te.vertexAlphas),
        (he.vertexTangents = te.vertexTangents),
        (he.toneMapping = te.toneMapping);
    }
    function Hn(de, te, he, pe, ge) {
      te.isScene !== !0 && (te = ue), oe.resetTextureUnits();
      let ye = te.fog,
        Le = pe.isMeshStandardMaterial ? te.environment : null,
        ke =
          E === null ? m.outputColorSpace : E.isXRRenderTarget === !0 ? E.texture.colorSpace : Er,
        Ue = (pe.isMeshStandardMaterial ? le : fe).get(pe.envMap || Le),
        ct =
          pe.vertexColors === !0 && !!he.attributes.color && he.attributes.color.itemSize === 4,
        De = !!he.attributes.tangent && (!!pe.normalMap || pe.anisotropy > 0),
        it = !!he.morphAttributes.position,
        gt = !!he.morphAttributes.normal,
        Ot = !!he.morphAttributes.color,
        xn = ys;
      pe.toneMapped && (E === null || E.isXRRenderTarget === !0) && (xn = m.toneMapping);
      let $t =
          he.morphAttributes.position || he.morphAttributes.normal || he.morphAttributes.color,
        Ht = $t !== void 0 ? $t.length : 0,
        Je = J.get(pe),
        Pt = x.state.lights;
      if (F === !0 && (X === !0 || de !== S)) {
        let Ni = de === S && pe.id === w;
        _e.setState(pe, de, Ni);
      }
      let Vt = !1;
      pe.version === Je.__version
        ? ((Je.needsLights && Je.lightsStateVersion !== Pt.state.version) ||
            Je.outputColorSpace !== ke ||
            (ge.isBatchedMesh && Je.batching === !1) ||
            (!ge.isBatchedMesh && Je.batching === !0) ||
            (ge.isBatchedMesh && Je.batchingColor === !0 && ge.colorTexture === null) ||
            (ge.isBatchedMesh && Je.batchingColor === !1 && ge.colorTexture !== null) ||
            (ge.isInstancedMesh && Je.instancing === !1) ||
            (!ge.isInstancedMesh && Je.instancing === !0) ||
            (ge.isSkinnedMesh && Je.skinning === !1) ||
            (!ge.isSkinnedMesh && Je.skinning === !0) ||
            (ge.isInstancedMesh && Je.instancingColor === !0 && ge.instanceColor === null) ||
            (ge.isInstancedMesh && Je.instancingColor === !1 && ge.instanceColor !== null) ||
            (ge.isInstancedMesh && Je.instancingMorph === !0 && ge.morphTexture === null) ||
            (ge.isInstancedMesh && Je.instancingMorph === !1 && ge.morphTexture !== null) ||
            Je.envMap !== Ue ||
            (pe.fog === !0 && Je.fog !== ye) ||
            (Je.numClippingPlanes !== void 0 &&
              (Je.numClippingPlanes !== _e.numPlanes ||
                Je.numIntersection !== _e.numIntersection)) ||
            Je.vertexAlphas !== ct ||
            Je.vertexTangents !== De ||
            Je.morphTargets !== it ||
            Je.morphNormals !== gt ||
            Je.morphColors !== Ot ||
            Je.toneMapping !== xn ||
            Je.morphTargetsCount !== Ht) &&
          (Vt = !0)
        : ((Vt = !0), (Je.__version = pe.version));
      let ss = Je.currentProgram;
      Vt === !0 && (ss = $i(pe, te, ge));
      let Hs = !1,
        Tt = !1,
        Ai = !1,
        sn = ss.getUniforms(),
        os = Je.uniforms;
      if (
        (L.useProgram(ss.program) && ((Hs = !0), (Tt = !0), (Ai = !0)),
        pe.id !== w && ((w = pe.id), (Tt = !0)),
        Hs || S !== de)
      ) {
        L.buffers.depth.getReversed() &&
          de.reversedDepth !== !0 &&
          ((de._reversedDepth = !0), de.updateProjectionMatrix()),
          sn.setValue(B, "projectionMatrix", de.projectionMatrix),
          sn.setValue(B, "viewMatrix", de.matrixWorldInverse);
        let Vs = sn.map.cameraPosition;
        Vs !== void 0 && Vs.setValue(B, re.setFromMatrixPosition(de.matrixWorld)),
          Y.logarithmicDepthBuffer &&
            sn.setValue(B, "logDepthBufFC", 2 / (Math.log(de.far + 1) / Math.LN2)),
          (pe.isMeshPhongMaterial ||
            pe.isMeshToonMaterial ||
            pe.isMeshLambertMaterial ||
            pe.isMeshBasicMaterial ||
            pe.isMeshStandardMaterial ||
            pe.isShaderMaterial) &&
            sn.setValue(B, "isOrthographic", de.isOrthographicCamera === !0),
          S !== de && ((S = de), (Tt = !0), (Ai = !0));
      }
      if (ge.isSkinnedMesh) {
        sn.setOptional(B, ge, "bindMatrix"), sn.setOptional(B, ge, "bindMatrixInverse");
        let Ni = ge.skeleton;
        Ni &&
          (Ni.boneTexture === null && Ni.computeBoneTexture(),
          sn.setValue(B, "boneTexture", Ni.boneTexture, oe));
      }
      ge.isBatchedMesh &&
        (sn.setOptional(B, ge, "batchingTexture"),
        sn.setValue(B, "batchingTexture", ge._matricesTexture, oe),
        sn.setOptional(B, ge, "batchingIdTexture"),
        sn.setValue(B, "batchingIdTexture", ge._indirectTexture, oe),
        sn.setOptional(B, ge, "batchingColorTexture"),
        ge._colorsTexture !== null &&
          sn.setValue(B, "batchingColorTexture", ge._colorsTexture, oe));
      let rs = he.morphAttributes;
      if (
        ((rs.position !== void 0 || rs.normal !== void 0 || rs.color !== void 0) &&
          Re.update(ge, he, ss),
        (Tt || Je.receiveShadow !== ge.receiveShadow) &&
          ((Je.receiveShadow = ge.receiveShadow),
          sn.setValue(B, "receiveShadow", ge.receiveShadow)),
        pe.isMeshGouraudMaterial &&
          pe.envMap !== null &&
          ((os.envMap.value = Ue),
          (os.flipEnvMap.value = Ue.isCubeTexture && Ue.isRenderTargetTexture === !1 ? -1 : 1)),
        pe.isMeshStandardMaterial &&
          pe.envMap === null &&
          te.environment !== null &&
          (os.envMapIntensity.value = te.environmentIntensity),
        Tt &&
          (sn.setValue(B, "toneMappingExposure", m.toneMappingExposure),
          Je.needsLights && fo(os, Ai),
          ye && pe.fog === !0 && k.refreshFogUniforms(os, ye),
          k.refreshMaterialUniforms(os, pe, C, D, x.state.transmissionRenderTarget[de.id]),
          Pc.upload(B, ya(Je), os, oe)),
        pe.isShaderMaterial &&
          pe.uniformsNeedUpdate === !0 &&
          (Pc.upload(B, ya(Je), os, oe), (pe.uniformsNeedUpdate = !1)),
        pe.isSpriteMaterial && sn.setValue(B, "center", ge.center),
        sn.setValue(B, "modelViewMatrix", ge.modelViewMatrix),
        sn.setValue(B, "normalMatrix", ge.normalMatrix),
        sn.setValue(B, "modelMatrix", ge.matrixWorld),
        pe.isShaderMaterial || pe.isRawShaderMaterial)
      ) {
        let Ni = pe.uniformsGroups;
        for (let Vs = 0, Sm = Ni.length; Vs < Sm; Vs++) {
          let l0 = Ni[Vs];
          dt.update(l0, ss), dt.bind(l0, ss);
        }
      }
      return ss;
    }
    function fo(de, te) {
      (de.ambientLightColor.needsUpdate = te),
        (de.lightProbe.needsUpdate = te),
        (de.directionalLights.needsUpdate = te),
        (de.directionalLightShadows.needsUpdate = te),
        (de.pointLights.needsUpdate = te),
        (de.pointLightShadows.needsUpdate = te),
        (de.spotLights.needsUpdate = te),
        (de.spotLightShadows.needsUpdate = te),
        (de.rectAreaLights.needsUpdate = te),
        (de.hemisphereLights.needsUpdate = te);
    }
    function ln(de) {
      return (
        de.isMeshLambertMaterial ||
        de.isMeshToonMaterial ||
        de.isMeshPhongMaterial ||
        de.isMeshStandardMaterial ||
        de.isShadowMaterial ||
        (de.isShaderMaterial && de.lights === !0)
      );
    }
    (this.getActiveCubeFace = function () {
      return _;
    }),
      (this.getActiveMipmapLevel = function () {
        return M;
      }),
      (this.getRenderTarget = function () {
        return E;
      }),
      (this.setRenderTargetTextures = function (de, te, he) {
        let pe = J.get(de);
        (pe.__autoAllocateDepthBuffer = de.resolveDepthBuffer === !1),
          pe.__autoAllocateDepthBuffer === !1 && (pe.__useRenderToTexture = !1),
          (J.get(de.texture).__webglTexture = te),
          (J.get(de.depthTexture).__webglTexture = pe.__autoAllocateDepthBuffer ? void 0 : he),
          (pe.__hasExternalTextures = !0);
      }),
      (this.setRenderTargetFramebuffer = function (de, te) {
        let he = J.get(de);
        (he.__webglFramebuffer = te), (he.__useDefaultFramebuffer = te === void 0);
      });
    let Zo = B.createFramebuffer();
    (this.setRenderTarget = function (de, te = 0, he = 0) {
      (E = de), (_ = te), (M = he);
      let pe = !0,
        ge = null,
        ye = !1,
        Le = !1;
      if (de) {
        let Ue = J.get(de);
        if (Ue.__useDefaultFramebuffer !== void 0)
          L.bindFramebuffer(B.FRAMEBUFFER, null), (pe = !1);
        else if (Ue.__webglFramebuffer === void 0) oe.setupRenderTarget(de);
        else if (Ue.__hasExternalTextures)
          oe.rebindTextures(
            de,
            J.get(de.texture).__webglTexture,
            J.get(de.depthTexture).__webglTexture,
          );
        else if (de.depthBuffer) {
          let it = de.depthTexture;
          if (Ue.__boundDepthTexture !== it) {
            if (
              it !== null &&
              J.has(it) &&
              (de.width !== it.image.width || de.height !== it.image.height)
            )
              throw new Error(
                "WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.",
              );
            oe.setupDepthRenderbuffer(de);
          }
        }
        let ct = de.texture;
        (ct.isData3DTexture || ct.isDataArrayTexture || ct.isCompressedArrayTexture) && (Le = !0);
        let De = J.get(de).__webglFramebuffer;
        de.isWebGLCubeRenderTarget
          ? (Array.isArray(De[te]) ? (ge = De[te][he]) : (ge = De[te]), (ye = !0))
          : de.samples > 0 && oe.useMultisampledRTT(de) === !1
            ? (ge = J.get(de).__webglMultisampledFramebuffer)
            : Array.isArray(De)
              ? (ge = De[he])
              : (ge = De),
          z.copy(de.viewport),
          H.copy(de.scissor),
          (O = de.scissorTest);
      } else z.copy(N).multiplyScalar(C).floor(), H.copy(Q).multiplyScalar(C).floor(), (O = K);
      if (
        (he !== 0 && (ge = Zo),
        L.bindFramebuffer(B.FRAMEBUFFER, ge) && pe && L.drawBuffers(de, ge),
        L.viewport(z),
        L.scissor(H),
        L.setScissorTest(O),
        ye)
      ) {
        let Ue = J.get(de.texture);
        B.framebufferTexture2D(
          B.FRAMEBUFFER,
          B.COLOR_ATTACHMENT0,
          B.TEXTURE_CUBE_MAP_POSITIVE_X + te,
          Ue.__webglTexture,
          he,
        );
      } else if (Le) {
        let Ue = te;
        for (let ct = 0; ct < de.textures.length; ct++) {
          let De = J.get(de.textures[ct]);
          B.framebufferTextureLayer(
            B.FRAMEBUFFER,
            B.COLOR_ATTACHMENT0 + ct,
            De.__webglTexture,
            he,
            Ue,
          );
        }
      } else if (de !== null && he !== 0) {
        let Ue = J.get(de.texture);
        B.framebufferTexture2D(
          B.FRAMEBUFFER,
          B.COLOR_ATTACHMENT0,
          B.TEXTURE_2D,
          Ue.__webglTexture,
          he,
        );
      }
      w = -1;
    }),
      (this.readRenderTargetPixels = function (de, te, he, pe, ge, ye, Le, ke = 0) {
        if (!(de && de.isWebGLRenderTarget)) {
          console.error(
            "THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.",
          );
          return;
        }
        let Ue = J.get(de).__webglFramebuffer;
        if ((de.isWebGLCubeRenderTarget && Le !== void 0 && (Ue = Ue[Le]), Ue)) {
          L.bindFramebuffer(B.FRAMEBUFFER, Ue);
          try {
            let ct = de.textures[ke],
              De = ct.format,
              it = ct.type;
            if (!Y.textureFormatReadable(De)) {
              console.error(
                "THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.",
              );
              return;
            }
            if (!Y.textureTypeReadable(it)) {
              console.error(
                "THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.",
              );
              return;
            }
            te >= 0 &&
              te <= de.width - pe &&
              he >= 0 &&
              he <= de.height - ge &&
              (de.textures.length > 1 && B.readBuffer(B.COLOR_ATTACHMENT0 + ke),
              B.readPixels(te, he, pe, ge, We.convert(De), We.convert(it), ye));
          } finally {
            let ct = E !== null ? J.get(E).__webglFramebuffer : null;
            L.bindFramebuffer(B.FRAMEBUFFER, ct);
          }
        }
      }),
      (this.readRenderTargetPixelsAsync = async function (de, te, he, pe, ge, ye, Le, ke = 0) {
        if (!(de && de.isWebGLRenderTarget))
          throw new Error(
            "THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.",
          );
        let Ue = J.get(de).__webglFramebuffer;
        if ((de.isWebGLCubeRenderTarget && Le !== void 0 && (Ue = Ue[Le]), Ue))
          if (te >= 0 && te <= de.width - pe && he >= 0 && he <= de.height - ge) {
            L.bindFramebuffer(B.FRAMEBUFFER, Ue);
            let ct = de.textures[ke],
              De = ct.format,
              it = ct.type;
            if (!Y.textureFormatReadable(De))
              throw new Error(
                "THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.",
              );
            if (!Y.textureTypeReadable(it))
              throw new Error(
                "THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.",
              );
            let gt = B.createBuffer();
            B.bindBuffer(B.PIXEL_PACK_BUFFER, gt),
              B.bufferData(B.PIXEL_PACK_BUFFER, ye.byteLength, B.STREAM_READ),
              de.textures.length > 1 && B.readBuffer(B.COLOR_ATTACHMENT0 + ke),
              B.readPixels(te, he, pe, ge, We.convert(De), We.convert(it), 0);
            let Ot = E !== null ? J.get(E).__webglFramebuffer : null;
            L.bindFramebuffer(B.FRAMEBUFFER, Ot);
            let xn = B.fenceSync(B.SYNC_GPU_COMMANDS_COMPLETE, 0);
            return (
              B.flush(),
              await Y5(B, xn, 4),
              B.bindBuffer(B.PIXEL_PACK_BUFFER, gt),
              B.getBufferSubData(B.PIXEL_PACK_BUFFER, 0, ye),
              B.deleteBuffer(gt),
              B.deleteSync(xn),
              ye
            );
          } else
            throw new Error(
              "THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.",
            );
      }),
      (this.copyFramebufferToTexture = function (de, te = null, he = 0) {
        let pe = Math.pow(2, -he),
          ge = Math.floor(de.image.width * pe),
          ye = Math.floor(de.image.height * pe),
          Le = te !== null ? te.x : 0,
          ke = te !== null ? te.y : 0;
        oe.setTexture2D(de, 0),
          B.copyTexSubImage2D(B.TEXTURE_2D, he, 0, 0, Le, ke, ge, ye),
          L.unbindTexture();
      });
    let yr = B.createFramebuffer(),
      lu = B.createFramebuffer();
    (this.copyTextureToTexture = function (de, te, he = null, pe = null, ge = 0, ye = null) {
      ye === null &&
        (ge !== 0
          ? (jl(
              "WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels.",
            ),
            (ye = ge),
            (ge = 0))
          : (ye = 0));
      let Le,
        ke,
        Ue,
        ct,
        De,
        it,
        gt,
        Ot,
        xn,
        $t = de.isCompressedTexture ? de.mipmaps[ye] : de.image;
      if (he !== null)
        (Le = he.max.x - he.min.x),
          (ke = he.max.y - he.min.y),
          (Ue = he.isBox3 ? he.max.z - he.min.z : 1),
          (ct = he.min.x),
          (De = he.min.y),
          (it = he.isBox3 ? he.min.z : 0);
      else {
        let rs = Math.pow(2, -ge);
        (Le = Math.floor($t.width * rs)),
          (ke = Math.floor($t.height * rs)),
          de.isDataArrayTexture
            ? (Ue = $t.depth)
            : de.isData3DTexture
              ? (Ue = Math.floor($t.depth * rs))
              : (Ue = 1),
          (ct = 0),
          (De = 0),
          (it = 0);
      }
      pe !== null ? ((gt = pe.x), (Ot = pe.y), (xn = pe.z)) : ((gt = 0), (Ot = 0), (xn = 0));
      let Ht = We.convert(te.format),
        Je = We.convert(te.type),
        Pt;
      te.isData3DTexture
        ? (oe.setTexture3D(te, 0), (Pt = B.TEXTURE_3D))
        : te.isDataArrayTexture || te.isCompressedArrayTexture
          ? (oe.setTexture2DArray(te, 0), (Pt = B.TEXTURE_2D_ARRAY))
          : (oe.setTexture2D(te, 0), (Pt = B.TEXTURE_2D)),
        B.pixelStorei(B.UNPACK_FLIP_Y_WEBGL, te.flipY),
        B.pixelStorei(B.UNPACK_PREMULTIPLY_ALPHA_WEBGL, te.premultiplyAlpha),
        B.pixelStorei(B.UNPACK_ALIGNMENT, te.unpackAlignment);
      let Vt = B.getParameter(B.UNPACK_ROW_LENGTH),
        ss = B.getParameter(B.UNPACK_IMAGE_HEIGHT),
        Hs = B.getParameter(B.UNPACK_SKIP_PIXELS),
        Tt = B.getParameter(B.UNPACK_SKIP_ROWS),
        Ai = B.getParameter(B.UNPACK_SKIP_IMAGES);
      B.pixelStorei(B.UNPACK_ROW_LENGTH, $t.width),
        B.pixelStorei(B.UNPACK_IMAGE_HEIGHT, $t.height),
        B.pixelStorei(B.UNPACK_SKIP_PIXELS, ct),
        B.pixelStorei(B.UNPACK_SKIP_ROWS, De),
        B.pixelStorei(B.UNPACK_SKIP_IMAGES, it);
      let sn = de.isDataArrayTexture || de.isData3DTexture,
        os = te.isDataArrayTexture || te.isData3DTexture;
      if (de.isDepthTexture) {
        let rs = J.get(de),
          Ni = J.get(te),
          Vs = J.get(rs.__renderTarget),
          Sm = J.get(Ni.__renderTarget);
        L.bindFramebuffer(B.READ_FRAMEBUFFER, Vs.__webglFramebuffer),
          L.bindFramebuffer(B.DRAW_FRAMEBUFFER, Sm.__webglFramebuffer);
        for (let l0 = 0; l0 < Ue; l0++)
          sn &&
            (B.framebufferTextureLayer(
              B.READ_FRAMEBUFFER,
              B.COLOR_ATTACHMENT0,
              J.get(de).__webglTexture,
              ge,
              it + l0,
            ),
            B.framebufferTextureLayer(
              B.DRAW_FRAMEBUFFER,
              B.COLOR_ATTACHMENT0,
              J.get(te).__webglTexture,
              ye,
              xn + l0,
            )),
            B.blitFramebuffer(ct, De, Le, ke, gt, Ot, Le, ke, B.DEPTH_BUFFER_BIT, B.NEAREST);
        L.bindFramebuffer(B.READ_FRAMEBUFFER, null), L.bindFramebuffer(B.DRAW_FRAMEBUFFER, null);
      } else if (ge !== 0 || de.isRenderTargetTexture || J.has(de)) {
        let rs = J.get(de),
          Ni = J.get(te);
        L.bindFramebuffer(B.READ_FRAMEBUFFER, yr), L.bindFramebuffer(B.DRAW_FRAMEBUFFER, lu);
        for (let Vs = 0; Vs < Ue; Vs++)
          sn
            ? B.framebufferTextureLayer(
                B.READ_FRAMEBUFFER,
                B.COLOR_ATTACHMENT0,
                rs.__webglTexture,
                ge,
                it + Vs,
              )
            : B.framebufferTexture2D(
                B.READ_FRAMEBUFFER,
                B.COLOR_ATTACHMENT0,
                B.TEXTURE_2D,
                rs.__webglTexture,
                ge,
              ),
            os
              ? B.framebufferTextureLayer(
                  B.DRAW_FRAMEBUFFER,
                  B.COLOR_ATTACHMENT0,
                  Ni.__webglTexture,
                  ye,
                  xn + Vs,
                )
              : B.framebufferTexture2D(
                  B.DRAW_FRAMEBUFFER,
                  B.COLOR_ATTACHMENT0,
                  B.TEXTURE_2D,
                  Ni.__webglTexture,
                  ye,
                ),
            ge !== 0
              ? B.blitFramebuffer(ct, De, Le, ke, gt, Ot, Le, ke, B.COLOR_BUFFER_BIT, B.NEAREST)
              : os
                ? B.copyTexSubImage3D(Pt, ye, gt, Ot, xn + Vs, ct, De, Le, ke)
                : B.copyTexSubImage2D(Pt, ye, gt, Ot, ct, De, Le, ke);
        L.bindFramebuffer(B.READ_FRAMEBUFFER, null), L.bindFramebuffer(B.DRAW_FRAMEBUFFER, null);
      } else
        os
          ? de.isDataTexture || de.isData3DTexture
            ? B.texSubImage3D(Pt, ye, gt, Ot, xn, Le, ke, Ue, Ht, Je, $t.data)
            : te.isCompressedArrayTexture
              ? B.compressedTexSubImage3D(Pt, ye, gt, Ot, xn, Le, ke, Ue, Ht, $t.data)
              : B.texSubImage3D(Pt, ye, gt, Ot, xn, Le, ke, Ue, Ht, Je, $t)
          : de.isDataTexture
            ? B.texSubImage2D(B.TEXTURE_2D, ye, gt, Ot, Le, ke, Ht, Je, $t.data)
            : de.isCompressedTexture
              ? B.compressedTexSubImage2D(
                  B.TEXTURE_2D,
                  ye,
                  gt,
                  Ot,
                  $t.width,
                  $t.height,
                  Ht,
                  $t.data,
                )
              : B.texSubImage2D(B.TEXTURE_2D, ye, gt, Ot, Le, ke, Ht, Je, $t);
      B.pixelStorei(B.UNPACK_ROW_LENGTH, Vt),
        B.pixelStorei(B.UNPACK_IMAGE_HEIGHT, ss),
        B.pixelStorei(B.UNPACK_SKIP_PIXELS, Hs),
        B.pixelStorei(B.UNPACK_SKIP_ROWS, Tt),
        B.pixelStorei(B.UNPACK_SKIP_IMAGES, Ai),
        ye === 0 && te.generateMipmaps && B.generateMipmap(Pt),
        L.unbindTexture();
    }),
      (this.initRenderTarget = function (de) {
        J.get(de).__webglFramebuffer === void 0 && oe.setupRenderTarget(de);
      }),
      (this.initTexture = function (de) {
        de.isCubeTexture
          ? oe.setTextureCube(de, 0)
          : de.isData3DTexture
            ? oe.setTexture3D(de, 0)
            : de.isDataArrayTexture || de.isCompressedArrayTexture
              ? oe.setTexture2DArray(de, 0)
              : oe.setTexture2D(de, 0),
          L.unbindTexture();
      }),
      (this.resetState = function () {
        (_ = 0), (M = 0), (E = null), L.reset(), Ne.reset();
      }),
      typeof __THREE_DEVTOOLS__ < "u" &&
        __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
  }
  get coordinateSystem() {
    return qs;
  }
  get outputColorSpace() {
    return this._outputColorSpace;
  }
  set outputColorSpace(e) {
    this._outputColorSpace = e;
    let t = this.getContext();
    (t.drawingBufferColorSpace = Kt._getDrawingBufferColorSpace(e)),
      (t.unpackColorSpace = Kt._getUnpackColorSpace());
  }
};
var oi = { min: new W(-40, 0, -30), max: new W(40, 30, 30), groundY: 0, seaY: -1.6, quayX: 30 },
  Mn = {
    dir: new W(0.916, 0.225, 0.331).normalize(),
    color: new Ve(1, 0.72, 0.42),
    intensity: 9,
  },
  en = {
    zenith: new Ve(0.055, 0.085, 0.13),
    horizon: new Ve(0.95, 0.55, 0.28),
    horizonAway: new Ve(0.16, 0.22, 0.3),
    fog: new Ve(0.42, 0.47, 0.52),
  },
  Pi = { eye: 1.68, crouchEye: 1.05, radius: 0.32, height: 1.8, fov: 74, viewFov: 54 },
  vf = 0,
  zc = 1,
  Pr = {
    test: {
      name: "test",
      scale: 1,
      msaa: 0,
      shadow: 1024,
      tex: 256,
      volSteps: 10,
      ao: !0,
      planar: 0.5,
      bloom: !0,
      motionBlur: !1,
      rain: 0.4,
    },
    low: {
      name: "low",
      scale: 0.7,
      msaa: 0,
      shadow: 2048,
      tex: 512,
      volSteps: 12,
      ao: !1,
      planar: 0,
      bloom: !0,
      motionBlur: !1,
      rain: 0.5,
    },
    medium: {
      name: "medium",
      scale: 0.85,
      msaa: 2,
      shadow: 2048,
      tex: 1024,
      volSteps: 16,
      ao: !0,
      planar: 0.5,
      bloom: !0,
      motionBlur: !1,
      rain: 0.8,
    },
    high: {
      name: "high",
      scale: 1,
      msaa: 4,
      shadow: 4096,
      tex: 1024,
      volSteps: 24,
      ao: !0,
      planar: 0.5,
      bloom: !0,
      motionBlur: !0,
      rain: 1,
    },
    ultra: {
      name: "ultra",
      scale: 1,
      msaa: 4,
      shadow: 4096,
      tex: 2048,
      volSteps: 40,
      ao: !0,
      planar: 1,
      bloom: !0,
      motionBlur: !0,
      rain: 1,
    },
  };
function zy(i) {
  if (i && Pr[i]) return { ...Pr[i] };
  if (
    /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 && Math.min(screen.width, screen.height) < 900)
  )
    return { ...Pr.low };
  let t = "";
  try {
    let s = document.createElement("canvas"),
      o = s.getContext("webgl2") || s.getContext("webgl");
    if (o) {
      let r = o.getExtension("WEBGL_debug_renderer_info");
      t = String(r ? o.getParameter(r.UNMASKED_RENDERER_WEBGL) : o.getParameter(o.RENDERER));
      let a = o.getExtension("WEBGL_lose_context");
      a && a.loseContext();
    }
  } catch {}
  return {
    ...(/SwiftShader|llvmpipe|Software|Mali|Adreno|PowerVR/i.test(t) ||
    (/Intel/i.test(t) && !/Arc/i.test(t))
      ? Pr.medium
      : Pr.high),
  };
}
function Dy() {
  let i = new Map();
  return {
    on(e, t) {
      return i.has(e) || i.set(e, []), i.get(e).push(t), () => this.off(e, t);
    },
    off(e, t) {
      let n = i.get(e);
      if (n) {
        let s = n.indexOf(t);
        s >= 0 && n.splice(s, 1);
      }
    },
    emit(e, t) {
      let n = i.get(e);
      if (n)
        for (let s = 0; s < n.length; s++)
          try {
            n[s](t);
          } catch (o) {
            console.error(`[events] handler for "${e}" threw`, o);
          }
    },
  };
}
function il(i = 1337) {
  let e = i >>> 0,
    t = () => {
      (e |= 0), (e = (e + 1831565813) | 0);
      let n = Math.imul(e ^ (e >>> 15), 1 | e);
      return (
        (n = (n + Math.imul(n ^ (n >>> 7), 61 | n)) ^ n), ((n ^ (n >>> 14)) >>> 0) / 4294967296
      );
    };
  return (
    (t.range = (n, s) => n + (s - n) * t()),
    (t.int = (n, s) => Math.floor(n + (s - n + 1) * t())),
    (t.pick = (n) => n[Math.floor(t() * n.length)]),
    (t.sign = () => (t() < 0.5 ? -1 : 1)),
    (t.fork = () => il(Math.floor(t() * 4294967296))),
    t
  );
}
var Zn = (i, e, t) => Math.min(t, Math.max(e, i)),
  bi = (i, e, t) => i + (e - i) * t,
  Fo = (i) => Math.min(1, Math.max(0, i)),
  sl = (i, e, t) => {
    let n = Fo((t - i) / (e - i));
    return n * n * (3 - 2 * n);
  },
  kn = (i, e, t, n) => e + (i - e) * Math.exp(-t * n);
var Wt = () => {},
  dr = {
    ground: () => ({ stub: !0, update: Wt, wetnessAt: () => 0.5, isPuddle: () => !1 }),
    backdrop: () => ({ stub: !0, update: Wt }),
    fx: () => ({
      stub: !0,
      update: Wt,
      muzzleFlash: Wt,
      tracer: Wt,
      impact: Wt,
      sparks: Wt,
      smoke: Wt,
      explosion: Wt,
      debris: Wt,
      shell: Wt,
      decal: Wt,
      dust: Wt,
      clear: Wt,
      splash: Wt,
      addEmitter: () => ({ stop: Wt, setPos: Wt }),
    }),
    audio: () => {
      let i = { setPos: Wt, setGain: Wt, setPitch: Wt, stop: Wt };
      return {
        stub: !0,
        update: Wt,
        resume: Wt,
        play: Wt,
        loop: () => i,
        setIntensity: Wt,
        setInterior: Wt,
        setVolume: Wt,
        setPaused: Wt,
      };
    },
    weapon: () => ({
      stub: !0,
      update: Wt,
      reset: Wt,
      setVisible: Wt,
      ammo: 30,
      magSize: 30,
      reserve: 120,
      state: "idle",
      name: "KR-7",
      ads: 0,
      spread: 0.01,
    }),
    enemies: () => ({
      stub: !0,
      list: [],
      update: Wt,
      spawn: () => null,
      raycast: () => null,
      aliveCount: () => 0,
      clear: Wt,
      alert: Wt,
    }),
    hud: () => ({ stub: !0, update: Wt, show: Wt, setObjective: Wt, message: Wt, hitmarker: Wt }),
    mats: () => {
      let i = new Map();
      return {
        stub: !0,
        get: (t) => (i.has(t) || i.set(t, new Qt({ color: 7829367, roughness: 0.7 })), i.get(t)),
        emissive: (t = 16777215, n = 4) => new Nn({ color: new Ve(t).multiplyScalar(n) }),
        names: [],
        decal: () => ({ material: new Nn({ transparent: !0, opacity: 0 }), aspect: 1 }),
        label: () => ({ material: new Nn({ transparent: !0, opacity: 0 }), aspect: 4 }),
        uniforms: { wet: { value: 1 } },
        update: Wt,
      };
    },
  };
function sa(i, e = !1) {
  let t = i[0].index !== null,
    n = new Set(Object.keys(i[0].attributes)),
    s = new Set(Object.keys(i[0].morphAttributes)),
    o = {},
    r = {},
    a = i[0].morphTargetsRelative,
    l = new nt(),
    c = 0;
  for (let u = 0; u < i.length; ++u) {
    let h = i[u],
      f = 0;
    if (t !== (h.index !== null))
      return (
        console.error(
          "THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " +
            u +
            ". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them.",
        ),
        null
      );
    for (let p in h.attributes) {
      if (!n.has(p))
        return (
          console.error(
            "THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " +
              u +
              '. All geometries must have compatible attributes; make sure "' +
              p +
              '" attribute exists among all geometries, or in none of them.',
          ),
          null
        );
      o[p] === void 0 && (o[p] = []), o[p].push(h.attributes[p]), f++;
    }
    if (f !== n.size)
      return (
        console.error(
          "THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " +
            u +
            ". Make sure all geometries have the same number of attributes.",
        ),
        null
      );
    if (a !== h.morphTargetsRelative)
      return (
        console.error(
          "THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " +
            u +
            ". .morphTargetsRelative must be consistent throughout all geometries.",
        ),
        null
      );
    for (let p in h.morphAttributes) {
      if (!s.has(p))
        return (
          console.error(
            "THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " +
              u +
              ".  .morphAttributes must be consistent throughout all geometries.",
          ),
          null
        );
      r[p] === void 0 && (r[p] = []), r[p].push(h.morphAttributes[p]);
    }
    if (e) {
      let p;
      if (t) p = h.index.count;
      else if (h.attributes.position !== void 0) p = h.attributes.position.count;
      else
        return (
          console.error(
            "THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " +
              u +
              ". The geometry must have either an index or a position attribute",
          ),
          null
        );
      l.addGroup(c, p, u), (c += p);
    }
  }
  if (t) {
    let u = 0,
      h = [];
    for (let f = 0; f < i.length; ++f) {
      let p = i[f].index;
      for (let d = 0; d < p.count; ++d) h.push(p.getX(d) + u);
      u += i[f].attributes.position.count;
    }
    l.setIndex(h);
  }
  for (let u in o) {
    let h = Ly(o[u]);
    if (!h)
      return (
        console.error(
          "THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " +
            u +
            " attribute.",
        ),
        null
      );
    l.setAttribute(u, h);
  }
  for (let u in r) {
    let h = r[u][0].length;
    if (h === 0) break;
    (l.morphAttributes = l.morphAttributes || {}), (l.morphAttributes[u] = []);
    for (let f = 0; f < h; ++f) {
      let p = [];
      for (let v = 0; v < r[u].length; ++v) p.push(r[u][v][f]);
      let d = Ly(p);
      if (!d)
        return (
          console.error(
            "THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " +
              u +
              " morphAttribute.",
          ),
          null
        );
      l.morphAttributes[u].push(d);
    }
  }
  return l;
}
function Ly(i) {
  let e,
    t,
    n,
    s = -1,
    o = 0;
  for (let c = 0; c < i.length; ++c) {
    let u = i[c];
    if ((e === void 0 && (e = u.array.constructor), e !== u.array.constructor))
      return (
        console.error(
          "THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes.",
        ),
        null
      );
    if ((t === void 0 && (t = u.itemSize), t !== u.itemSize))
      return (
        console.error(
          "THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes.",
        ),
        null
      );
    if ((n === void 0 && (n = u.normalized), n !== u.normalized))
      return (
        console.error(
          "THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes.",
        ),
        null
      );
    if ((s === -1 && (s = u.gpuType), s !== u.gpuType))
      return (
        console.error(
          "THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes.",
        ),
        null
      );
    o += u.count * t;
  }
  let r = new e(o),
    a = new et(r, t, n),
    l = 0;
  for (let c = 0; c < i.length; ++c) {
    let u = i[c];
    if (u.isInterleavedBufferAttribute) {
      let h = l / t;
      for (let f = 0, p = u.count; f < p; f++)
        for (let d = 0; d < t; d++) {
          let v = u.getComponent(f, d);
          a.setComponent(f + h, d, v);
        }
    } else r.set(u.array, l);
    l += u.count * t;
  }
  return s !== void 0 && (a.gpuType = s), a;
}
var oa = new W();
function $e(i, e, t, n = "center") {
  let s = new un(i, e, t),
    o = s.attributes.uv,
    r = s.attributes.position,
    a = s.attributes.normal;
  for (let l = 0; l < o.count; l++) {
    let c = Math.abs(a.getX(l)),
      u = Math.abs(a.getY(l)),
      h = r.getX(l),
      f = r.getY(l),
      p = r.getZ(l);
    c > 0.5 ? o.setXY(l, p, f) : u > 0.5 ? o.setXY(l, h, p) : o.setXY(l, h, f);
  }
  return n === "bottom" && s.translate(0, e / 2, 0), s;
}
function Wi(i, e, t, n = 0.02, s = "center") {
  n = Math.min(n, i / 2 - 1e-4, e / 2 - 1e-4, t / 2 - 1e-4);
  let o = new un(i, e, t, 3, 3, 3),
    r = o.attributes.position,
    a = o.attributes.normal,
    l = o.attributes.uv,
    c = i / 2,
    u = e / 2,
    h = t / 2,
    f = (p, d) => {
      let v = Math.abs(p),
        g = Math.sign(p);
      return v > d - 1e-5 ? g * d : g * (d - n);
    };
  for (let p = 0; p < r.count; p++) {
    let d = f(r.getX(p), c),
      v = f(r.getY(p), u),
      g = f(r.getZ(p), h),
      x = Math.max(-(c - n), Math.min(c - n, d)),
      y = Math.max(-(u - n), Math.min(u - n, v)),
      b = Math.max(-(h - n), Math.min(h - n, g));
    if ((oa.set(d - x, v - y, g - b), oa.lengthSq() > 1e-10)) {
      oa.normalize();
      let M = a.getX(p),
        E = a.getY(p),
        w = a.getZ(p);
      (Math.abs(d) > c - 1e-5 ? 1 : 0) +
        (Math.abs(v) > u - 1e-5 ? 1 : 0) +
        (Math.abs(g) > h - 1e-5 ? 1 : 0) >=
      2
        ? ((d = x + oa.x * n),
          (v = y + oa.y * n),
          (g = b + oa.z * n),
          a.setXYZ(p, oa.x, oa.y, oa.z))
        : a.setXYZ(p, M, E, w);
    }
    r.setXYZ(p, d, v, g);
    let m = Math.abs(a.getX(p)),
      A = Math.abs(a.getY(p)),
      _ = Math.abs(a.getZ(p));
    m >= A && m >= _ ? l.setXY(p, g, v) : A >= m && A >= _ ? l.setXY(p, d, g) : l.setXY(p, d, v);
  }
  return s === "bottom" && o.translate(0, e / 2, 0), o;
}
function ot(i, e, t, n = 16, s = !1, o = "center") {
  let r = new Ys(i, e, t, n, 1, s),
    a = r.attributes.uv,
    l = r.attributes.position,
    c = r.attributes.normal,
    u = Math.PI * (i + e);
  for (let h = 0; h < a.count; h++)
    Math.abs(c.getY(h)) > 0.9
      ? a.setXY(h, l.getX(h), l.getZ(h))
      : a.setXY(h, a.getX(h) * u, l.getY(h));
  return o === "bottom" && r.translate(0, t / 2, 0), r;
}
function Fn(i, e = 0.03, t = 8, n = !1, s = 0) {
  let o = i.map((h) => (h.isVector3 ? h : new W(h[0], h[1], h[2]))),
    r = new Jr(o, n, "catmullrom", s),
    a = r.getLength(),
    l = Math.max(2, Math.ceil(a / Math.max(0.08, e * 3))),
    c = new Kr(r, Math.min(l, 400), e, t, n),
    u = c.attributes.uv;
  for (let h = 0; h < u.count; h++) u.setXY(h, u.getX(h) * a, u.getY(h) * Math.PI * 2 * e);
  return c;
}
var ky = new Ye(),
  Fy = new Lt(),
  Uy = new In(),
  Ny = new W(),
  Fg = new W();
function Dc(i, { p: e = [0, 0, 0], r: t = [0, 0, 0], s: n = 1 } = {}) {
  return (
    Uy.set(t[0], t[1], t[2]),
    Fy.setFromEuler(Uy),
    Ny.set(e[0], e[1], e[2]),
    typeof n == "number" ? Fg.set(n, n, n) : Fg.set(n[0], n[1], n[2]),
    ky.compose(Ny, Fy, Fg),
    i.applyMatrix4(ky),
    i
  );
}
function Lc(i, e) {
  let t = i.attributes.position,
    n = t.count,
    s = new Float32Array(n * 3);
  for (let o = 0; o < n; o++) {
    let r = typeof e == "function" ? e(t.getX(o), t.getY(o), t.getZ(o)) : e;
    (s[o * 3] = r[0]), (s[o * 3 + 1] = r[1]), (s[o * 3 + 2] = r[2]);
  }
  return i.setAttribute("color", new et(s, 3)), i;
}
function Ii(i) {
  let e = i
    .filter(Boolean)
    .map(
      (l) => (
        l.attributes.uv ||
          l.setAttribute("uv", new et(new Float32Array(l.attributes.position.count * 2), 2)),
        l.attributes.normal || l.computeVertexNormals(),
        l
      ),
    );
  if (!e.length) return new nt();
  let t = e.some((l) => l.attributes.color),
    n = e.map((l) => {
      let c = (l.index, l);
      if (t && !c.attributes.color) {
        let u = new Float32Array(c.attributes.position.count * 3).fill(1);
        c.setAttribute("color", new et(u, 3));
      }
      for (let u of Object.keys(c.attributes))
        ["position", "normal", "uv", "color"].includes(u) || c.deleteAttribute(u);
      return c;
    }),
    s = n.every((l) => l.index),
    o = n.every((l) => !l.index),
    r = s || o ? n : n.map((l) => (l.index ? l.toNonIndexed() : l));
  return sa(r, !1) || new nt();
}
function By(i, { castShadow: e = !0, receiveShadow: t = !0 } = {}) {
  i.updateMatrixWorld(!0);
  let n = new Map(),
    s = [];
  i.traverse((r) => {
    if (!r.isMesh) return;
    let a = r,
      l = !1;
    for (; a; ) {
      if (a.userData && a.userData.noMerge) {
        l = !0;
        break;
      }
      a = a.parent;
    }
    if (l || r.isSkinnedMesh || r.isInstancedMesh || Array.isArray(r.material)) {
      s.push(r);
      return;
    }
    let c =
      r.material.uuid +
      (r.castShadow ? "c" : "n") +
      (r.receiveShadow ? "r" : "n") +
      ":" +
      r.layers.mask;
    n.has(c) ||
      n.set(c, {
        mat: r.material,
        geos: [],
        cast: r.castShadow,
        recv: r.receiveShadow,
        layers: r.layers.mask,
      });
    let u = r.geometry.clone();
    u.applyMatrix4(r.matrixWorld), n.get(c).geos.push(u);
  });
  let o = new wt();
  for (let r of n.values()) {
    let a = new Qe(Ii(r.geos), r.mat);
    (a.castShadow = r.cast && e),
      (a.receiveShadow = r.recv && t),
      (a.layers.mask = r.layers),
      o.add(a);
  }
  for (let r of s) {
    r.updateMatrixWorld(!0);
    let a = r.matrixWorld.clone();
    o.add(r), r.matrix.copy(a), r.matrix.decompose(r.position, r.quaternion, r.scale);
  }
  return o;
}
function Qi(i, e, { cast: t = !0, recv: n = !0 } = {}) {
  let s = new Qe(i, e);
  return (s.castShadow = t), (s.receiveShadow = n), s;
}
var Vg = {};
br(Vg, { create: () => Hg, showcase: () => sA });
var Ug = `
uniform sampler2D tNoise;
float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return texture2D(tNoise, (i + f + 0.5) / 256.0).r; }
float fbm5(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++){ s += a * n2(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p + 17.3; a *= 0.5; } return s / 0.96875; }
float fbm3(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 3; i++){ s += a * n2(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p + 17.3; a *= 0.5; } return s / 0.875; }
`,
  Ng = `
uniform vec3 uSunDir, uZen, uHor, uHorAway, uSunCol;
float skyToSun(vec3 d){ return clamp(dot(normalize(d.xz + vec2(1e-5)), normalize(uSunDir.xz)) * 0.5 + 0.5, 0.0, 1.0); }
vec3 horizonColor(vec3 d){
float ts = skyToSun(d);
vec3 c = mix(uHorAway, uHorAway * 1.25 + vec3(0.05, 0.03, 0.02), smoothstep(0.2, 0.75, ts));
c = mix(c, uHor * vec3(1.9, 1.55, 1.2), pow(ts, 6.0));
c = mix(c, vec3(1.0, 0.60, 0.24) * 3.4, pow(ts, 34.0));
return c;
}
`;
function Oy() {
  let e = new Uint8Array(262144),
    t = 2654435769,
    n = () => (
      (t ^= t << 13), (t >>>= 0), (t ^= t >>> 17), (t ^= t << 5), (t >>>= 0), t / 4294967296
    );
  for (let o = 0; o < 256 * 256; o++)
    (e[o * 4] = n() * 256),
      (e[o * 4 + 1] = n() * 256),
      (e[o * 4 + 2] = n() * 256),
      (e[o * 4 + 3] = 255);
  let s = new ui(e, 256, 256, _n, yi);
  return (
    (s.wrapS = s.wrapT = Is),
    (s.magFilter = s.minFilter = Zt),
    (s.generateMipmaps = !1),
    (s.colorSpace = hi),
    (s.needsUpdate = !0),
    s
  );
}
var H6 = `
// SALTLINE_SKY
precision highp float;
varying vec3 vDir;
uniform float uTime, uEnv, uFlash;
uniform vec3 uFlashDir;
${Ug}
${Ng}

void main(){
vec3 d = normalize(vDir);
float h = max(d.y, 0.0);
float mu = dot(d, uSunDir);
float s = max(mu, 0.0);
float ts = skyToSun(d);

// ---- clear sky behind / below the deck ----
vec3 hc = horizonColor(d);
vec3 midC = mix(vec3(0.15, 0.24, 0.36), vec3(0.72, 0.50, 0.34), pow(ts, 3.0));   // pale band above the fire
vec3 clearC = mix(hc, midC, smoothstep(0.0, 0.17, h));
clearC = mix(clearC, vec3(0.085, 0.145, 0.24), smoothstep(0.10, 0.5, h));
// aureole (mie glow round the sun)
clearC += uSunCol * vec3(1.0, 0.86, 0.68) * (pow(s, 8.0) * 0.14 + pow(s, 64.0) * 0.55 + pow(s, 600.0) * 2.2 + pow(s, 6000.0) * 14.0);

// ---- cloud deck ----
vec2 cuv = d.xz / (h + 0.10) * vec2(0.62, 0.95);          // rolls of cloud run roughly east-west
vec2 wind = vec2(-0.012, 0.004) * uTime;
vec2 q = cuv + wind;
float warp = fbm3(q * 0.45 + 7.1);
vec2 qq = q + (warp - 0.5) * 1.3;
float dens = fbm5(qq);
// rippled underside (ridged detail), fading with distance so the horizon does not alias
float ridg = 1.0 - abs(2.0 * fbm3(qq * 3.1 + 5.0) - 1.0);
dens = dens * 0.86 + (ridg - 0.6) * 0.16 * smoothstep(0.03, 0.25, h);
float big = n2(q * 0.19 + 3.7);
float body = dens * 0.74 + big * 0.36;
float cov = smoothstep(0.31, 0.50, body);
// the deck ends above the eastern horizon: clear, burning gap toward the sun; almost down to the sea elsewhere
float edge = mix(0.030, 0.285, pow(ts, 1.7));
float rag = (n2(q * 0.9 + 11.0) - 0.5) * 0.16 + (dens - 0.5) * 0.10;
float deck = smoothstep(edge - 0.035, edge + 0.11, h + rag * (0.35 + ts));
cov *= deck;
// the sun always burns through a ragged hole in the gap, never sits behind solid cloud
float hole = smoothstep(0.972, 0.9985, mu + (dens - 0.5) * 0.012);
cov *= 1.0 - 0.93 * hole;
// thin scud drifting in the gap (veils the sun a little, catches fire)
float scud = smoothstep(0.55, 0.85, fbm3(q * vec2(0.55, 1.9) + 31.0)) * (1.0 - deck) * smoothstep(0.02, 0.10, h) * 0.55 * (1.0 - 0.8 * hole);

// lighting: density gradient toward the sun = self shadowing of the underside relief
vec2 sd = normalize(uSunDir.xz);
float densS = fbm5(qq + sd * 0.22);
float relief = clamp((dens - densS) * 4.5 + 0.5, 0.0, 1.0);
float thick = smoothstep(0.40, 0.72, body);
vec3 cool = mix(vec3(0.155, 0.195, 0.255), vec3(0.030, 0.042, 0.064), thick);       // slate, darker where the deck is thick
cool *= 0.55 + 0.9 * relief * relief;
cool += vec3(0.07, 0.10, 0.15) * pow(1.0 - thick, 3.0);                             // thin spots let cold light through
// warm light raking the underside from the gap: strongest near the sun and near the deck edge
float nearSun = pow(ts, 5.0) * exp(-max(h - edge, 0.0) * 4.5) * 0.9 + pow(s, 7.0) * 0.9;
vec3 warm = (uHor * vec3(1.30, 0.66, 0.40)) * nearSun * (0.05 + 2.2 * relief * relief * relief) * 1.15;
// burning rim where cloud thins at the edge of the gap
float rim = cov * (1.0 - cov) * 4.0;
warm += uSunCol * rim * pow(ts, 4.0) * (0.5 + 1.6 * pow(s, 6.0)) * (1.0 - 0.85 * hole);
vec3 cloudC = cool + warm;
// sheet lightning inside the deck
float fl = uFlash * pow(max(dot(d, uFlashDir), 0.0), 5.0);
cloudC += vec3(0.55, 0.68, 1.0) * fl * (0.4 + 2.2 * dens * dens);
// aerial perspective: far cloud melts into the horizon colour
cloudC = mix(cloudC, hc * 0.55 + cloudC * 0.45, exp(-h * 11.0));

vec3 col = mix(clearC, cloudC, cov * 0.985);
vec3 scudC = mix(vec3(0.10, 0.11, 0.14), uHor * 1.5, pow(ts, 3.0)) + uSunCol * pow(s, 24.0) * 2.0;
col = mix(col, scudC, scud);

// sun disk (not in the environment capture: the directional light is the sun there)
float veil = (1.0 - cov * 0.92) * (1.0 - scud * 0.7);
float disk = smoothstep(0.999905, 0.999955, mu);
col += vec3(1.0, 0.80, 0.52) * disk * 110.0 * veil * (1.0 - uEnv);

// below the horizon: sea haze / ground bounce (mostly hidden by geometry)
if (d.y < 0.0) {
  float t = clamp(-d.y * 5.0, 0.0, 1.0);
  vec3 low = mix(uHorAway * 0.42, vec3(0.060, 0.064, 0.070), uEnv);
  low += uHor * 0.55 * pow(ts, 6.0) * exp(d.y * 7.0);
  col = mix(hc + uSunCol * pow(s, 48.0) * 1.5, low, smoothstep(0.0, 1.0, t));
}
// keep the PMREM free of fireflies
col = mix(col, min(col, vec3(6.0)), uEnv);
gl_FragColor = vec4(max(col, vec3(0.0)), 1.0);
}`,
  V6 = `
varying vec3 vDir;
void main(){ vDir = position; vec4 p = projectionMatrix * vec4(mat3(viewMatrix) * position, 1.0); gl_Position = p.xyww; }`;
function W6(i) {
  return {
    tNoise: { value: i },
    uTime: { value: 0 },
    uEnv: { value: 0 },
    uFlash: { value: 0 },
    uFlashDir: { value: new W(-0.5, 0.5, -0.7).normalize() },
    uSunDir: { value: Mn.dir.clone() },
    uZen: { value: en.zenith.clone() },
    uHor: { value: en.horizon.clone() },
    uHorAway: { value: en.horizonAway.clone() },
    uSunCol: { value: Mn.color.clone() },
  };
}
function Hy(i) {
  let e = new zn({
      name: "saltline-sky",
      side: Ki,
      depthWrite: !1,
      depthTest: !0,
      fog: !1,
      toneMapped: !1,
      uniforms: W6(i),
      vertexShader: V6,
      fragmentShader: H6,
    }),
    t = new un(2, 2, 2),
    n = new Qe(t, e);
  return (
    (n.name = "sky"),
    (n.frustumCulled = !1),
    (n.renderOrder = -1e3),
    (n.castShadow = !1),
    (n.receiveShadow = !1),
    (n.matrixAutoUpdate = !1),
    { mesh: n, material: e, geometry: t }
  );
}
function Vy(i, e) {
  let t = new ia(i),
    n = e.material.clone();
  (n.uniforms.tNoise.value = e.material.uniforms.tNoise.value), (n.uniforms.uEnv.value = 1);
  let s = new ir(),
    o = new Qe(e.geometry, n);
  (o.frustumCulled = !1), s.add(o);
  let r = t.fromScene(s, 0, 0.1, 100);
  return n.dispose(), t.dispose(), r;
}
var Wy = "// SALTLINE_SHADOW",
  xf = null;
function Gy(i, e, t, n, s) {
  let o = Mn.dir.clone().normalize(),
    r = e.clone().add(t).multiplyScalar(0.5);
  i.target.position.copy(r),
    i.position.copy(r).addScaledVector(o, 200),
    i.updateMatrixWorld(!0),
    i.target.updateMatrixWorld(!0);
  let a = new Ye().lookAt(i.position, r, new W(0, 1, 0));
  a.setPosition(i.position), a.invert();
  let l = new W(),
    c = 1 / 0,
    u = -1 / 0,
    h = 1 / 0,
    f = -1 / 0,
    p = 1 / 0,
    d = -1 / 0,
    v = (y, b, m) => {
      for (let A = 0; A < 8; A++)
        l.set(A & 1 ? b.x : y.x, A & 2 ? b.y : y.y, A & 4 ? b.z : y.z).applyMatrix4(a), m(l);
    };
  v(e, t, (y) => {
    (c = Math.min(c, y.x)),
      (u = Math.max(u, y.x)),
      (h = Math.min(h, y.y)),
      (f = Math.max(f, y.y)),
      (p = Math.min(p, -y.z)),
      (d = Math.max(d, -y.z));
  }),
    v(n, s, (y) => {
      p = Math.min(p, -y.z);
    });
  let g = i.shadow.camera,
    x = 1;
  return (
    (g.left = c - x),
    (g.right = u + x),
    (g.bottom = h - x),
    (g.top = f + x),
    (g.near = Math.max(1, p - 4)),
    (g.far = d + 4),
    g.updateProjectionMatrix(),
    { width: g.right - g.left, height: g.top - g.bottom, depth: g.far - g.near }
  );
}
function qy(i, { taps: e = 16, searchTaps: t = 8 } = {}) {
  let n = It.shadowmap_pars_fragment;
  xf === null && (xf = n);
  let s = xf,
    o = s.indexOf("float getShadow("),
    r = s.indexOf("vec2 cubeToUV"),
    a = s.lastIndexOf("// cubeToUV()", r);
  if ((a < o && (a = r), o < 0 || r < 0 || r < o))
    return (
      console.warn(
        "[render] soft shadows: unexpected Three shader chunk layout, keeping stock PCF",
      ),
      !1
    );
  let l = `
	${Wy}
	const vec2 SL_FRUSTUM = vec2( ${i.width.toFixed(3)}, ${i.height.toFixed(3)} );   // metres across the shadow map
	const float SL_DEPTH = ${i.depth.toFixed(3)};                                       // metres across the depth range
	float slIGN( vec2 p ) { return fract( 52.9829189 * fract( dot( p, vec2( 0.06711056, 0.00583715 ) ) ) ); }
	vec2 slVogel( int i, int n, float phi ) {
		float r = sqrt( ( float( i ) + 0.5 ) / float( n ) );
		float th = float( i ) * 2.39996323 + phi;
		return r * vec2( cos( th ), sin( th ) );
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		shadowCoord.xyz /= shadowCoord.w;
		vec3 sc = shadowCoord.xyz;
		vec3 dx = dFdx( sc ), dy = dFdy( sc );
		bool inFrustum = sc.x >= 0.0 && sc.x <= 1.0 && sc.y >= 0.0 && sc.y <= 1.0;
		if ( ! ( inFrustum && sc.z <= 1.0 ) ) return 1.0;
		// receiver plane depth bias: depth gradient of the receiver in shadow-map uv space
		float det = dx.x * dy.y - dx.y * dy.x;
		vec2 dz = vec2( 0.0 );
		if ( abs( det ) > 1e-12 ) dz = vec2( dy.y * dx.z - dx.y * dy.z, dx.x * dy.z - dy.x * dx.z ) / det;
		vec2 texel = 1.0 / shadowMapSize;
		float maxSlope = 0.0030 / max( texel.x, texel.y );      // never bias more than ~0.6 m per kernel
		dz = clamp( dz, vec2( - maxSlope ), vec2( maxSlope ) );
		float zr = sc.z + shadowBias - ( abs( dz.x ) * texel.x + abs( dz.y ) * texel.y ) * 0.35;
		float phi = slIGN( gl_FragCoord.xy ) * 6.2831853;
		// --- blocker search ---
		vec2 searchR = ( 0.55 * shadowRadius ) / SL_FRUSTUM;     // metres -> uv
		float blk = 0.0, nb = 0.0;
		for ( int i = 0; i < ${t}; i ++ ) {
			vec2 o = slVogel( i, ${t}, phi ) * searchR;
			float d = unpackRGBAToDepth( texture2D( shadowMap, sc.xy + o ) );
			float z = zr + dot( o, dz );
			if ( d < z ) { blk += d; nb += 1.0; }
		}
		if ( nb < 0.5 ) return 1.0;
		float avg = blk / nb;
		// --- penumbra: grows with blocker distance (sun half-angle scaled up for look) ---
		float distM = max( zr - avg, 0.0 ) * SL_DEPTH;
		float penM = clamp( distM * 0.022 * shadowRadius, 0.012 * shadowRadius, 0.60 * shadowRadius );
		vec2 filtR = max( vec2( penM ) / SL_FRUSTUM, texel * 1.25 );
		float lit = 0.0;
		for ( int i = 0; i < ${e}; i ++ ) {
			vec2 o = slVogel( i, ${e}, phi + 1.7 ) * filtR;
			float d = unpackRGBAToDepth( texture2D( shadowMap, sc.xy + o ) );
			lit += step( zr + dot( o, dz ), d );
		}
		lit /= float( ${e} );
		// fade to lit at the very edge of the map so the frustum border never shows
		vec2 e = min( sc.xy, 1.0 - sc.xy );
		lit = mix( 1.0, lit, smoothstep( 0.0, 0.02, min( e.x, e.y ) ) );
		return mix( 1.0, lit, shadowIntensity );
	}

	`;
  return (It.shadowmap_pars_fragment = s.slice(0, o) + l + s.slice(a)), !0;
}
function Xy() {
  xf !== null && (It.shadowmap_pars_fragment = xf);
}
var Yy = Wy;
var Bg = "// SALTLINE_POST",
  n1 = "0.05",
  Zy = "0.05",
  G6 = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
  Js = `
varying vec2 vUv;
float ign(vec2 p){ return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float luma(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
`,
  Og = `
uniform sampler2D tAdapt; uniform float uExposure, uKey, uMinE, uMaxE, uAuto;
float slExposure(){ float a = texture2D(tAdapt, vec2(0.5)).r; return uExposure * mix(1.0, clamp(pow(uKey / max(a, 1e-4), 0.85), uMinE, uMaxE), uAuto); }
`,
  q6 = `${Js}
uniform sampler2D tDepth;
void main(){ gl_FragDepth = texture2D(tDepth, vUv).r; gl_FragColor = vec4(0.0); }`,
  X6 = `${Js}
uniform sampler2D tDepth; uniform float uNear, uFar;
void main(){
// exact texel fetch: sampling at a texel corner would pick rows unpredictably and band the AO on grazing floors
ivec2 p = min(ivec2(gl_FragCoord.xy) * 2, textureSize(tDepth, 0) - 1);
float d = texelFetch(tDepth, p, 0).r;
float z = d < ${n1} ? 0.01 : (uNear * uFar) / (uFar - d * (uFar - uNear));
gl_FragColor = vec4(z, 0.0, 0.0, 1.0);
}`,
  Y6 = `${Js}
uniform sampler2D tDepthHalf; uniform vec2 uTanHalf, uTexel; uniform float uRadius, uIntensity, uAspect;
vec3 vpos(vec2 uv, float z){ return vec3((uv * 2.0 - 1.0) * uTanHalf * z, -z); }
void main(){
float z0 = texture2D(tDepthHalf, vUv).r;
if (z0 < ${Zy} || z0 > 140.0) { gl_FragColor = vec4(1.0); return; }
vec3 P = vpos(vUv, z0);
vec2 ox = vec2(uTexel.x, 0.0), oy = vec2(0.0, uTexel.y);
float zl = texture2D(tDepthHalf, vUv - ox).r, zr = texture2D(tDepthHalf, vUv + ox).r;
float zd = texture2D(tDepthHalf, vUv - oy).r, zu = texture2D(tDepthHalf, vUv + oy).r;
vec3 dx = abs(zl - z0) < abs(zr - z0) ? P - vpos(vUv - ox, zl) : vpos(vUv + ox, zr) - P;
vec3 dy = abs(zd - z0) < abs(zu - z0) ? P - vpos(vUv - oy, zd) : vpos(vUv + oy, zu) - P;
vec3 n = normalize(cross(dx, dy));
float R = uRadius * (0.6 + 0.4 * clamp(z0 / 12.0, 0.0, 1.0));
float rUv = clamp(R / (2.0 * z0 * uTanHalf.y), 3.0 * uTexel.y, 0.14);
float R2 = R * R;
float rot = ign(gl_FragCoord.xy) * 6.2831853;
float sum = 0.0;
for (int i = 0; i < AO_TAPS; i++) {
  float a = (float(i) + 0.5) / float(AO_TAPS);
  float th = a * 6.2831853 * 3.0 + rot;
  vec2 o = vec2(cos(th), sin(th)) * a * rUv; o.x /= uAspect;
  vec2 uv2 = vUv + o;
  float z2 = texture2D(tDepthHalf, uv2).r;
  vec3 v = vpos(uv2, z2) - P;
  float vv = dot(v, v), vn = dot(v, n);
  float f = max(R2 - vv, 0.0);
  sum += f * f * f * max((vn - (0.015 + 0.004 * z0)) / (vv + 0.004), 0.0);
}
float ao = max(0.0, 1.0 - uIntensity * sum * 5.0 / (R2 * R2 * R2 * float(AO_TAPS)));
ao = mix(ao, 1.0, smoothstep(70.0, 140.0, z0));
gl_FragColor = vec4(ao, ao, ao, 1.0);
}`,
  $6 = `${Js}
uniform sampler2D tDepthHalf, tShadow;
uniform mat4 uShadowMatrix, uCamWorld;
uniform vec3 uCamPos, uSunRad, uAmb;
uniform vec2 uTanHalf;
uniform float uHasShadow, uMaxDist, uSigma, uFarZ, uFarHaze, uFlicker, uBoxDust;
uniform vec3 uBoxMin, uBoxMax;
${Ng}
float shape(float h){ return 0.30 + 0.70 * exp(-max(h, 0.0) / 5.5); }
float hg(float mu, float g){ float g2 = g * g; return (1.0 - g2) / (12.566371 * pow(max(1.0 + g2 - 2.0 * g * mu, 1e-4), 1.5)); }
float sunVis(vec3 p){
vec4 sc = uShadowMatrix * vec4(p, 1.0);
if (sc.x < 0.0 || sc.x > 1.0 || sc.y < 0.0 || sc.y > 1.0 || sc.z > 1.0 || sc.z < 0.0) return 1.0;
float d = dot(texture2D(tShadow, sc.xy), vec4(0.99609375, 0.99609375 / 256.0, 0.99609375 / 65536.0, 1.0 / 16777216.0));
return step(sc.z - 0.0006, d);
}
void main(){
float z = texture2D(tDepthHalf, vUv).r;
if (z < ${Zy}) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }
vec3 vd = vec3((vUv * 2.0 - 1.0) * uTanHalf, -1.0);
float rl = length(vd);
vec3 rd = normalize(mat3(uCamWorld) * vd);
float dist = z * rl;
bool isSky = z > uFarZ * 0.97;
float maxD = min(dist, isSky ? uMaxDist * 0.55 : uMaxDist);
float mu = dot(rd, uSunDir);
// two-lobe phase: tight forward lobe for the gold glow toward the sun + a broad lobe so side-lit shafts stay visible
float ph = min(hg(mu, 0.78) * 0.55 + hg(mu, 0.25) * 0.45, 1.15);
float j = ign(gl_FragCoord.xy);
vec3 acc = vec3(0.0); float T = 1.0; float tPrev = 0.0;
for (int i = 0; i < VOL_STEPS; i++) {
  float f = (float(i) + 1.0) / float(VOL_STEPS);
  float t1 = maxD * f * (0.35 + 0.65 * f);              // denser sampling near the eye
  float ds = t1 - tPrev;
  vec3 p = uCamPos + rd * (tPrev + ds * j);
  float sh = uHasShadow > 0.5 ? sunVis(p) : 1.0;
  // dusty interior (the shed): thicker air so sun shafts through doors, louvres and roof holes read; less sky ambient
  vec3 bq = step(uBoxMin, p) * step(p, uBoxMax); float inb = bq.x * bq.y * bq.z;
  float ext = uSigma * shape(p.y) * (1.0 + uBoxDust * inb);
  float Ti = exp(-ext * ds);
  // art direction: beams near the eye read strongly (shafts between stacks), the far field stays a restrained veil
  float nearW = mix(2.3, 0.55, smoothstep(4.0, 85.0, tPrev + ds * j));
  vec3 src = uSunRad * (ph * sh * mix(nearW, 1.6, inb)) + uAmb * (0.40 + 0.60 * sh) * mix(1.0, 0.22, inb);
  acc += T * src * (1.0 - Ti);
  T *= Ti; tPrev = t1;
}
// analytic continuation for far geometry (ship, cranes, skyline): fades into the horizon colour of that direction
if (!isSky && dist > uMaxDist) {
  float h1 = uCamPos.y + rd.y * uMaxDist, h2 = uCamPos.y + rd.y * dist;
  float tau = uSigma * uFarHaze * (dist - uMaxDist) * 0.5 * (shape(h1) + shape(h2));
  float Tf = exp(-tau);
  vec3 hc = horizonColor(rd) * 0.50 + uAmb * 0.6;
  acc += T * hc * (1.0 - Tf);
  T *= Tf;
}
gl_FragColor = vec4(acc, T);
}`,
  $y = `${Js}
uniform sampler2D tSrc, tDepthHalf; uniform vec2 uDir;
void main(){
float z0 = texture2D(tDepthHalf, vUv).r;
float zc = min(z0, 300.0);
vec4 acc = vec4(0.0); float ws = 0.0;
for (int i = -3; i <= 3; i++) {
  vec2 uv = vUv + uDir * float(i);
  float z = min(texture2D(tDepthHalf, uv).r, 300.0);
  float w = (1.0 - abs(float(i)) * 0.22) * max(0.0, 1.0 - abs(z - zc) / (BLUR_TOL * zc + 0.02));
  acc += texture2D(tSrc, uv) * w; ws += w;
}
gl_FragColor = ws > 1e-4 ? acc / ws : texture2D(tSrc, vUv);
}`,
  Z6 = `${Js}
uniform sampler2D tColor, tDepth, tDepthHalf, tAO, tVol;
uniform vec2 uHalfRes; uniform float uNear, uFar, uAoOn, uVolOn, uAoStrength;
${Og}
void main(){
vec3 col = max(texture2D(tColor, vUv).rgb, vec3(0.0));
float d = texture2D(tDepth, vUv).r;
if (d >= ${n1}) {
  float z = (uNear * uFar) / (uFar - d * (uFar - uNear));
  // joint bilateral upsample of the half-res buffers
  vec2 hp = vUv * uHalfRes - 0.5; vec2 f = fract(hp); vec2 base = (floor(hp) + 0.5) / uHalfRes; vec2 tx = 1.0 / uHalfRes;
  float ao = 0.0; vec4 vol = vec4(0.0); float ws = 0.0;
  float zc = min(z, 300.0);
  for (int k = 0; k < 4; k++) {
    vec2 o = vec2(float(k & 1), float(k >> 1));
    vec2 uv = base + o * tx;
    float zh = min(texture2D(tDepthHalf, uv).r, 300.0);
    float w = (o.x > 0.5 ? f.x : 1.0 - f.x) * (o.y > 0.5 ? f.y : 1.0 - f.y);
    w *= 1.0 / (0.015 + abs(zh - zc) / zc) ;
    w = max(w, 1e-5);
    ao += texture2D(tAO, uv).r * w; vol += texture2D(tVol, uv) * w; ws += w;
  }
  ao /= ws; vol /= ws;
  if (uAoOn > 0.5 && d < 0.99999) {
    // occlusion belongs to ambient light: fade it out on brightly lit pixels so sunlit surfaces never get dirty halos
    float lit = smoothstep(0.16, 0.85, luma(col) * slExposure());
    float a = mix(1.0, ao, uAoStrength * (1.0 - 0.8 * lit));
    col *= mix(vec3(a), vec3(1.0), vec3(0.0, 0.03, 0.07));      // faintly cool occlusion
  }
  if (uVolOn > 0.5) col = col * vol.a + vol.rgb;
}
gl_FragColor = vec4(col, 1.0);
}`,
  j6 = `${Js}
uniform sampler2D tColor, tDepth; uniform mat4 uInvViewProj, uPrevViewProj; uniform float uShutter; uniform vec2 uRes;
void main(){
vec4 c0 = texture2D(tColor, vUv);
float d = texture2D(tDepth, vUv).r;
if (d < ${n1}) { gl_FragColor = c0; return; }
vec4 wp = uInvViewProj * vec4(vUv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0); wp /= wp.w;
vec4 pc = uPrevViewProj * wp;
vec2 puv = pc.xy / max(pc.w, 1e-4) * 0.5 + 0.5;
vec2 vel = (vUv - puv) * uShutter;
float len = length(vel);
if (pc.w <= 0.0 || len * uRes.y < 0.75) { gl_FragColor = c0; return; }
vel *= min(1.0, 0.018 / len);
float j = ign(gl_FragCoord.xy) - 0.5;
vec3 acc = c0.rgb; float ws = 1.0;
for (int i = 0; i < 9; i++) {
  vec2 uv = vUv + vel * ((float(i) + 0.5 + j) / 9.0 - 0.5);
  float w = texture2D(tDepth, uv).r < ${n1} ? 0.0 : 1.0;
  acc += texture2D(tColor, uv).rgb * w; ws += w;
}
gl_FragColor = vec4(acc / ws, 1.0);
}`,
  J6 = `${Js}
uniform sampler2D tSrc; uniform vec2 uTexel; uniform float uFirst;
vec3 s(vec2 o){ return min(max(texture2D(tSrc, vUv + o * uTexel).rgb, vec3(0.0)), vec3(400.0)); }
float kw(vec3 c){ return 1.0 / (1.0 + luma(c) * 0.08); }
void main(){
vec3 a = s(vec2(-2.0, 2.0)), b = s(vec2(0.0, 2.0)), c = s(vec2(2.0, 2.0));
vec3 d = s(vec2(-2.0, 0.0)), e = s(vec2(0.0, 0.0)), f = s(vec2(2.0, 0.0));
vec3 g = s(vec2(-2.0, -2.0)), h = s(vec2(0.0, -2.0)), i = s(vec2(2.0, -2.0));
vec3 j = s(vec2(-1.0, 1.0)), k = s(vec2(1.0, 1.0)), l = s(vec2(-1.0, -1.0)), m = s(vec2(1.0, -1.0));
vec3 col;
if (uFirst > 0.5) {
  // partial Karis average on the first downsample: tames fireflies without killing the sun
  vec3 g0 = (a + b + d + e) * 0.25, g1 = (b + c + e + f) * 0.25, g2 = (d + e + g + h) * 0.25, g3 = (e + f + h + i) * 0.25, g4 = (j + k + l + m) * 0.25;
  float w0 = kw(g0) * 0.125, w1 = kw(g1) * 0.125, w2 = kw(g2) * 0.125, w3 = kw(g3) * 0.125, w4 = kw(g4) * 0.5;
  col = (g0 * w0 + g1 * w1 + g2 * w2 + g3 * w3 + g4 * w4) / (w0 + w1 + w2 + w3 + w4);
} else {
  col = e * 0.125 + (a + c + g + i) * 0.03125 + (b + d + f + h) * 0.0625 + (j + k + l + m) * 0.125;
}
gl_FragColor = vec4(col, 1.0);
}`,
  K6 = `${Js}
uniform sampler2D tLow, tHigh; uniform vec2 uTexel; uniform float uMix;
void main(){
vec2 o = uTexel;
vec3 t = texture2D(tLow, vUv).rgb * 4.0;
t += (texture2D(tLow, vUv + vec2(o.x, 0.0)).rgb + texture2D(tLow, vUv - vec2(o.x, 0.0)).rgb + texture2D(tLow, vUv + vec2(0.0, o.y)).rgb + texture2D(tLow, vUv - vec2(0.0, o.y)).rgb) * 2.0;
t += texture2D(tLow, vUv + o).rgb + texture2D(tLow, vUv - o).rgb + texture2D(tLow, vUv + vec2(o.x, -o.y)).rgb + texture2D(tLow, vUv + vec2(-o.x, o.y)).rgb;
t *= 1.0 / 16.0;
gl_FragColor = vec4(mix(texture2D(tHigh, vUv).rgb, t, uMix), 1.0);
}`,
  Q6 = `${Js}
uniform sampler2D tSrc; uniform vec2 uDir; uniform float uThreshold;
${Og}
void main(){
float thr = uThreshold / max(slExposure(), 0.2);
vec3 acc = vec3(0.0); float ws = 0.0;
for (int i = -7; i <= 7; i++) {
  float x = float(i); float w = exp(-x * x / 18.0);
  vec3 c = texture2D(tSrc, vUv + uDir * x).rgb;
  c = max(c - vec3(thr), vec3(0.0));
  acc += c * w; ws += w;
}
gl_FragColor = vec4(acc / ws, 1.0);
}`,
  eA = `${Js}
uniform sampler2D tPrev, tLum, tDepth; uniform vec2 uSunUv; uniform float uSunOn, uRate, uVisRate, uAspect;
void main(){
float ls = 0.0, ws = 0.0;
for (int y = 0; y < 5; y++) for (int x = 0; x < 7; x++) {
  vec2 uv = (vec2(float(x), float(y)) + 0.5) / vec2(7.0, 5.0);
  vec2 c = uv - 0.5;
  float w = 1.0 - 0.75 * smoothstep(0.1, 0.55, length(c));       // centre-weighted metering
  float l = luma(texture2D(tLum, uv).rgb);
  ls += log(max(l, 1e-4)) * w; ws += w;
}
float avg = clamp(exp(ls / ws), 0.002, 40.0);
float vis = 0.0;
for (int i = 0; i < 12; i++) {
  float r = sqrt((float(i) + 0.5) / 12.0) * 0.011; float th = float(i) * 2.39996323;
  vec2 uv = uSunUv + vec2(cos(th) / uAspect, sin(th)) * r;
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) vis += 1.0;
  else vis += step(0.99999, texture2D(tDepth, uv).r);
}
vis = vis / 12.0 * uSunOn;
vec4 prev = texture2D(tPrev, vec2(0.5));
float a = mix(prev.r, avg, uRate);
if (!(a > 0.0) || a > 1e4) a = avg;                                 // NaN / first-frame guard
float v = mix(prev.g, vis, uVisRate);
if (!(v >= 0.0)) v = vis;
gl_FragColor = vec4(a, v, 0.0, 1.0);
}`,
  tA = `${Js}
${Ug}
uniform float uAspect;
void main(){
vec2 p = vUv * vec2(uAspect, 1.0);
float acc = 0.0;
for (int i = 0; i < 70; i++) {
  float fi = float(i);
  vec2 c = vec2(hash12(vec2(fi, 1.7)), hash12(vec2(fi, 9.2))) * vec2(uAspect, 1.0);
  float sz = mix(0.012, 0.085, pow(hash12(vec2(fi, 4.4)), 3.0));
  float r = length(p - c) / sz;
  float disc = smoothstep(1.0, 0.86, r) * (0.35 + 0.65 * smoothstep(0.35, 0.98, r));
  acc += disc * mix(0.15, 0.7, hash12(vec2(fi, 6.1)));
}
float smudge = fbm5(vUv * vec2(5.0, 9.0) + 3.0) * fbm3(vUv * 2.3 + 9.0);
float streaks = pow(n2(vec2(vUv.x * 90.0, vUv.y * 2.0)), 4.0) * 0.25;
float v = acc * 0.55 + smudge * 0.9 + streaks;
v *= 0.45 + 0.9 * smoothstep(0.15, 0.75, length(vUv - 0.5));
gl_FragColor = vec4(vec3(v) * vec3(1.0, 0.96, 0.9), 1.0);
}`,
  nA = `${Js}
uniform sampler2D tScene, tBloom, tBlur, tStreak, tDirt;
${Og}
uniform vec3 uSunCol;
uniform vec2 uSunUv;
uniform float uTime, uAspect, uBloom, uDirt, uStreak, uFlare, uCA, uVignette;
uniform float uDamage, uLowHealth, uAds, uFlash, uFade, uSaturation, uSunOn, uThunder, uAgxMix;

// ---- AgX (Filament/Blender fit, as in three.js) ----
const mat3 SL_REC2020_TO_SRGB = mat3(vec3(1.6605, -0.1246, -0.0182), vec3(-0.5876, 1.1329, -0.1006), vec3(-0.0728, -0.0083, 1.1187));
const mat3 SL_SRGB_TO_REC2020 = mat3(vec3(0.6274, 0.0691, 0.0164), vec3(0.3293, 0.9195, 0.0880), vec3(0.0433, 0.0113, 0.8956));
vec3 slAgxContrast(vec3 x){ vec3 x2 = x * x; vec3 x4 = x2 * x2; return 15.5 * x4 * x2 - 40.14 * x4 * x + 31.96 * x4 - 6.868 * x2 * x + 0.4298 * x2 + 0.1191 * x - 0.00232; }
vec3 slAgx(vec3 color){
const mat3 inset = mat3(vec3(0.856627153315983, 0.137318972929847, 0.11189821299995), vec3(0.0951212405381588, 0.761241990602591, 0.0767994186031903), vec3(0.0482516061458583, 0.101439036467562, 0.811302368396859));
const mat3 outset = mat3(vec3(1.1271005818144368, -0.1413297634984383, -0.14132976349843826), vec3(-0.11060664309660323, 1.157823702216272, -0.11060664309660294), vec3(-0.016493938717834573, -0.016493938717834257, 1.2519364065950405));
const float minEv = -12.47393, maxEv = 4.026069;
color = inset * (SL_SRGB_TO_REC2020 * color);
color = clamp((log2(max(color, 1e-10)) - minEv) / (maxEv - minEv), 0.0, 1.0);
color = slAgxContrast(color);
// "punchy"-style look: a little more contrast and chroma than the base AgX rendering
float l = dot(color, vec3(0.2126, 0.7152, 0.0722));
color = pow(max(color, vec3(0.0)), vec3(LOOK_POWER));
color = l + (color - l) * LOOK_SAT;
color = outset * color;
color = pow(max(color, vec3(0.0)), vec3(2.2));
return clamp(SL_REC2020_TO_SRGB * color, 0.0, 1.0);
}
vec3 slRRTODT(vec3 v){ vec3 a = v * (v + 0.0245786) - 0.000090537; vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081; return a / b; }
vec3 slAces(vec3 c){
const mat3 inM = mat3(vec3(0.59719, 0.07600, 0.02840), vec3(0.35458, 0.90834, 0.13383), vec3(0.04823, 0.01566, 0.83777));
const mat3 outM = mat3(vec3(1.60475, -0.10208, -0.00327), vec3(-0.53108, 1.10813, -0.07276), vec3(-0.07367, -0.00605, 1.07602));
return clamp(outM * slRRTODT(inM * (c * 1.3)), 0.0, 1.0);
}
vec3 toSRGB(vec3 c){ return mix(c * 12.92, 1.055 * pow(max(c, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c)); }

vec3 flare(vec2 uv, vec2 sun, float vis){
vec2 asp = vec2(uAspect, 1.0);
vec2 p = (uv - 0.5) * asp, s = (sun - 0.5) * asp;
vec2 dv = p - s; float r = length(dv);
vec3 c = vec3(0.0);
// veiling glare + a few soft diffraction spikes
float ang = atan(dv.y, dv.x);
float spikes = pow(abs(cos(ang * 3.0 + 0.4)), 24.0) + 0.6 * pow(abs(cos(ang * 4.0 - 1.1)), 40.0);
c += uSunCol * (0.020 / (r * r * 9.0 + 0.010) + 0.10 * exp(-r * 3.2));
c += uSunCol * spikes * 0.30 * exp(-r * 5.5);
// ghosts along the sun -> centre axis
vec3 g = vec3(0.0);
float k0 = length(p + s * 0.38);  g += vec3(0.30, 0.75, 0.55) * smoothstep(0.085, 0.06, k0) * 0.050;
float k1 = length(p + s * 0.82);  g += vec3(0.85, 0.45, 0.25) * smoothstep(0.045, 0.030, k1) * 0.075;
float k2 = length(p + s * 1.35);  g += vec3(0.35, 0.50, 0.95) * smoothstep(0.17, 0.12, k2) * (0.4 + 0.6 * smoothstep(0.05, 0.16, k2)) * 0.040;
float k3 = length(p - s * 0.45);  g += vec3(0.80, 0.70, 0.35) * smoothstep(0.030, 0.018, k3) * 0.060;
// halo ring opposite the sun
float hr = length(p + s * 0.15);
g += vec3(0.45, 0.55, 0.85) * exp(-pow((hr - 0.52) * 16.0, 2.0)) * 0.035 * smoothstep(0.1, 0.5, length(s));
c += g * uSunCol * 2.4;
return c * vis;
}

void main(){
vec2 c = vUv - 0.5;
float r2 = dot(c * vec2(uAspect, 1.0), c * vec2(uAspect, 1.0)) / (0.25 * (uAspect * uAspect + 1.0));   // 0 centre .. 1 corner
vec4 ad = texture2D(tAdapt, vec2(0.5));
// radial chromatic aberration (tiny; grows a little when hurt)
vec2 off = c * r2 * (uCA + uDamage * 0.006);
vec3 col = vec3(texture2D(tScene, vUv + off).r, texture2D(tScene, vUv).g, texture2D(tScene, vUv - off).b);
// ADS: soften the periphery
vec3 soft = texture2D(tBlur, vUv).rgb;
col = mix(col, soft, uAds * 0.75 * smoothstep(0.22, 0.85, r2));
// bloom (energy conserving mix), lens dirt, anamorphic streak
vec3 bloom = texture2D(tBloom, vUv).rgb;
vec3 dirt = texture2D(tDirt, vUv).rgb;
col = mix(col, bloom, uBloom);
col += bloom * dirt * uDirt;
col += texture2D(tStreak, vUv).rgb * vec3(0.45, 0.62, 1.0) * uStreak;
// sun glare + flare (occlusion-tested)
float vis = ad.g * uSunOn;
if (vis > 0.002) { vec3 fl = flare(vUv, uSunUv, vis) * uFlare; col += fl * (1.0 + dirt * 1.5); }
// exposure: manual * eye adaptation
col *= slExposure();
col += vec3(1.0, 0.97, 0.9) * uFlash * 2.5;
// filmic curve: ACES (Hill fit) for punch and burning oranges, pulled toward AgX so highlights roll off to white
col = mix(slAces(col), slAgx(col), uAgxMix);

// ---- grade (display-linear) ----
float l = luma(col);
// split tone: teal shadows, warm highlights
vec3 sh = vec3(0.80, 1.01, 1.13), hi = vec3(1.07, 1.0, 0.90);
col *= mix(sh, hi, smoothstep(0.03, 0.55, l));
// gentle S-curve
col = mix(col, col * col * (3.0 - 2.0 * col), 0.22);
// lifted, slightly teal blacks
col = col * 0.988 + vec3(0.006, 0.0085, 0.011);
// saturation (gameplay driven)
float sat = uSaturation * (1.0 - 0.65 * uLowHealth) * (1.0 - 0.5 * uDamage);
l = luma(col);
col = mix(vec3(l), col, sat);
// vignette: base + low health + ADS tightening
float vig = uVignette + uLowHealth * 0.55 + uAds * 0.22;
float vr = smoothstep(0.15 - uAds * 0.08, 1.05, r2);
col *= 1.0 - vig * vr * vr * (3.0 - 2.0 * vr) ;
// damage: red-edged pulse
float edge = smoothstep(0.18, 1.0, r2);
col = mix(col, vec3(0.55, 0.02, 0.01) * (0.35 + l), clamp(uDamage * edge * 0.85 + uLowHealth * edge * edge * 0.25 * (0.75 + 0.25 * sin(uTime * 5.0)), 0.0, 1.0));
col *= 1.0 - uFade;
col = toSRGB(clamp(col, 0.0, 1.0));
gl_FragColor = vec4(col, dot(col, vec3(0.299, 0.587, 0.114)));
}`,
  iA = `${Js}
uniform sampler2D tSrc; uniform vec2 uTexel; uniform float uTime, uGrain, uSharpen, uFxaa;
void main(){
vec4 M = texture2D(tSrc, vUv);
vec3 col = M.rgb;
vec4 NW = texture2D(tSrc, vUv + vec2(-1.0, -1.0) * uTexel), NE = texture2D(tSrc, vUv + vec2(1.0, -1.0) * uTexel);
vec4 SW = texture2D(tSrc, vUv + vec2(-1.0, 1.0) * uTexel), SE = texture2D(tSrc, vUv + vec2(1.0, 1.0) * uTexel);
float lMin = min(M.a, min(min(NW.a, NE.a), min(SW.a, SE.a)));
float lMax = max(M.a, max(max(NW.a, NE.a), max(SW.a, SE.a)));
float contrast = lMax - lMin;
if (uFxaa > 0.5 && contrast > max(0.0312, lMax * 0.10)) {
  vec2 dir = vec2(-((NW.a + NE.a) - (SW.a + SE.a)), (NW.a + SW.a) - (NE.a + SE.a));
  float dirReduce = max((NW.a + NE.a + SW.a + SE.a) * 0.03125, 0.0078125);
  float rcp = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
  dir = clamp(dir * rcp, vec2(-8.0), vec2(8.0)) * uTexel;
  vec4 A = 0.5 * (texture2D(tSrc, vUv + dir * (1.0 / 3.0 - 0.5)) + texture2D(tSrc, vUv + dir * (2.0 / 3.0 - 0.5)));
  vec4 B = A * 0.5 + 0.25 * (texture2D(tSrc, vUv - dir * 0.5) + texture2D(tSrc, vUv + dir * 0.5));
  col = (B.a < lMin || B.a > lMax) ? A.rgb : B.rgb;
}
// light unsharp mask, backed off on strong edges (those belong to FXAA)
vec3 blur = (NW.rgb + NE.rgb + SW.rgb + SE.rgb) * 0.25;
col += (M.rgb - blur) * uSharpen * (1.0 - smoothstep(0.04, 0.22, contrast));
// animated, luminance-weighted film grain
vec2 seed = gl_FragCoord.xy + fract(uTime * vec2(7.31, 3.17)) * vec2(311.7, 173.3);
float g = hash12(seed) + hash12(seed + 57.3) - 1.0;
float l = dot(col, vec3(0.299, 0.587, 0.114));
col += g * uGrain * mix(1.0, 0.30, smoothstep(0.25, 0.9, l)) * (0.35 + 0.65 * smoothstep(0.0, 0.08, l));
// dither against banding in the sky gradients
col += (hash12(gl_FragCoord.xy * 1.37 + 11.0) + hash12(gl_FragCoord.xy * 0.71 + 3.0) - 1.0) / 255.0;
gl_FragColor = vec4(col, 1.0);
}`;
function jy(i, e, { noiseTex: t }) {
  let n = new nt();
  n.setAttribute("position", new et(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3)),
    n.setAttribute("uv", new et(new Float32Array([0, 0, 2, 0, 0, 2]), 2));
  let s = new Qe(n, null);
  s.frustumCulled = !1;
  let o = new cr(-1, 1, 1, -1, 0, 1),
    r = [],
    a = (oe, fe, le, R = {}) => {
      let I = new zn({
        name: "post-" + oe,
        vertexShader: G6,
        fragmentShader: `${Bg} ${oe}
${fe}`,
        uniforms: le,
        depthTest: !1,
        depthWrite: !1,
        blending: ko,
        toneMapped: !1,
        ...R,
      });
      return r.push(I), I;
    };
  function l(oe, fe) {
    (s.material = oe), i.setRenderTarget(fe), i.render(s, o);
  }
  let c = js,
    u = yi,
    h = Zt,
    f = Gn,
    p = (oe = c, fe = h, le = {}) => {
      let R = new si(4, 4, {
        type: oe,
        format: _n,
        minFilter: fe,
        magFilter: fe,
        depthBuffer: !1,
        stencilBuffer: !1,
        generateMipmaps: !1,
        ...le,
      });
      return (R.texture.generateMipmaps = !1), R;
    },
    d = () => e.quality,
    v = () => ({
      uSunDir: { value: Mn.dir.clone() },
      uZen: { value: en.zenith.clone() },
      uHor: { value: en.horizon.clone() },
      uHorAway: { value: en.horizonAway.clone() },
      uSunCol: { value: Mn.color.clone() },
    }),
    g = {
      volSunScale: 0.85,
      volAmbient: 0.2,
      volSigma: 0.0034,
      volMaxDist: 170,
      volFarHaze: 0.42,
      volInteriorDust: 6,
      aoRadius: 0.9,
      aoIntensity: 1.6,
      aoStrength: 0.95,
      bloom: 0.065,
      bloomMix: 0.62,
      dirt: 0.1,
      streak: 0.03,
      streakThreshold: 2.2,
      flare: 0.16,
      key: 0.12,
      minExposure: 0.6,
      maxExposure: 2,
      adaptTau: 1.5,
      agxMix: 0.25,
      ca: 0.0013,
      vignette: 0.3,
      grain: 0.02,
      sharpen: 0.3,
      lookPower: 1.18,
      lookSat: 1.22,
      taaFeedback: 0.12,
    },
    x = !1;
  try {
    x = !!i.extensions.has("EXT_color_buffer_float");
  } catch {
    x = !1;
  }
  const taaFrag = `${Js}
uniform sampler2D tColor, tHistory, tDepth; uniform mat4 uInvViewProj, uPrevViewProj; uniform vec2 uRes; uniform float uFeedback;
void main(){
vec4 cur = texture2D(tColor, vUv);
float d = texture2D(tDepth, vUv).r;
if (d < ${n1} || d >= 0.9999) { gl_FragColor = cur; return; }
vec4 wp = uInvViewProj * vec4(vUv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0); wp /= wp.w;
vec4 pc = uPrevViewProj * wp;
vec2 puv = pc.xy / max(pc.w, 1e-4) * 0.5 + 0.5;
if (pc.w <= 0.0 || puv.x < 0.0 || puv.x > 1.0 || puv.y < 0.0 || puv.y > 1.0) { gl_FragColor = cur; return; }
vec3 hist = texture2D(tHistory, puv).rgb;
vec3 mn = cur.rgb, mx = cur.rgb;
for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
  vec3 c = texture2D(tColor, vUv + vec2(float(x), float(y)) / uRes).rgb;
  mn = min(mn, c); mx = max(mx, c);
}
vec3 box = (mn + mx) * 0.5, halfRange = (mx - mn) * 0.5 + vec3(1e-4);
hist = clamp(hist, box - halfRange, box + halfRange);
gl_FragColor = vec4(mix(cur.rgb, hist, uFeedback), 1.0);
}`,
    blitFrag = `${Js}
uniform sampler2D tSrc;
void main(){ gl_FragColor = vec4(texture2D(tSrc, vUv).rgb, 1.0); }`;
  let y = {
      scene: p(c, h),
      motion: p(c, h),
      taa: [p(c, h), p(c, h)],
      ldr: p(u, h),
      final: p(u, h),
      depthHalf: x ? p(as, f, { format: J0 }) : p(c, f),
      aoA: p(u, f),
      aoB: p(u, f),
      volA: p(c, f),
      volB: p(c, f),
      down: [],
      up: [],
      streakA: p(c, h),
      streakB: p(c, h),
      adapt: [p(c, f), p(c, f)],
      dirt: p(u, h),
      depthCopy: null,
    },
    b = 6;
  for (let oe = 0; oe < b; oe++) y.down.push(p(c, h));
  for (let oe = 0; oe < b - 1; oe++) y.up.push(p(c, h));
  y.adapt[0].setSize(1, 1), y.adapt[1].setSize(1, 1), y.dirt.setSize(512, 288);
  let m = 0,
    A = 0,
    _ = !1,
    M = { w: 4, h: 4, hw: 2, hh: 2 },
    E = {
      tAdapt: { value: null },
      uExposure: { value: 1 },
      uKey: { value: g.key },
      uMinE: { value: g.minExposure },
      uMaxE: { value: g.maxExposure },
      uAuto: { value: 1 },
    },
    w = a(
      "depthcopy",
      q6,
      { tDepth: { value: null } },
      { depthTest: !0, depthWrite: !0, depthFunc: q0, colorWrite: !1 },
    ),
    S = a("depthhalf", X6, {
      tDepth: { value: null },
      uNear: { value: 0.08 },
      uFar: { value: 900 },
    }),
    z = a(
      "ao",
      Y6,
      {
        tDepthHalf: { value: y.depthHalf.texture },
        uTanHalf: { value: new Ae() },
        uTexel: { value: new Ae() },
        uRadius: { value: g.aoRadius },
        uIntensity: { value: g.aoIntensity },
        uAspect: { value: 1 },
      },
      { defines: { AO_TAPS: 12 } },
    ),
    H = a(
      "vol",
      $6,
      {
        tDepthHalf: { value: y.depthHalf.texture },
        tShadow: { value: null },
        uShadowMatrix: { value: new Ye() },
        uCamWorld: { value: new Ye() },
        uCamPos: { value: new W() },
        uSunRad: { value: new W() },
        uAmb: { value: new W() },
        uTanHalf: { value: new Ae() },
        uHasShadow: { value: 0 },
        uMaxDist: { value: g.volMaxDist },
        uSigma: { value: g.volSigma },
        uFarZ: { value: 900 },
        uFarHaze: { value: g.volFarHaze },
        uFlicker: { value: 0 },
        uBoxDust: { value: 0 },
        uBoxMin: { value: new W(1e6, 1e6, 1e6) },
        uBoxMax: { value: new W(-1e6, -1e6, -1e6) },
        ...v(),
      },
      { defines: { VOL_STEPS: 16 } },
    ),
    O = a(
      "blur-ao",
      $y,
      {
        tSrc: { value: null },
        tDepthHalf: { value: y.depthHalf.texture },
        uDir: { value: new Ae() },
      },
      { defines: { BLUR_TOL: "0.04" } },
    ),
    q = a(
      "blur-vol",
      $y,
      {
        tSrc: { value: null },
        tDepthHalf: { value: y.depthHalf.texture },
        uDir: { value: new Ae() },
      },
      { defines: { BLUR_TOL: "0.30" } },
    ),
    U = a("composite", Z6, {
      tColor: { value: null },
      tDepth: { value: null },
      tDepthHalf: { value: y.depthHalf.texture },
      tAO: { value: y.aoA.texture },
      tVol: { value: y.volA.texture },
      uHalfRes: { value: new Ae() },
      uNear: { value: 0.08 },
      uFar: { value: 900 },
      uAoOn: { value: 1 },
      uVolOn: { value: 1 },
      uAoStrength: { value: g.aoStrength },
      ...E,
    }),
    T = a("motion", j6, {
      tColor: { value: y.scene.texture },
      tDepth: { value: null },
      uInvViewProj: { value: new Ye() },
      uPrevViewProj: { value: new Ye() },
      uShutter: { value: 0.5 },
      uRes: { value: new Ae() },
    }),
    D = a("down", J6, {
      tSrc: { value: null },
      uTexel: { value: new Ae() },
      uFirst: { value: 0 },
    }),
    C = a("up", K6, {
      tLow: { value: null },
      tHigh: { value: null },
      uTexel: { value: new Ae() },
      uMix: { value: g.bloomMix },
    }),
    G = a("streak", Q6, {
      tSrc: { value: null },
      uDir: { value: new Ae() },
      uThreshold: { value: 0 },
      ...E,
    }),
    j = a("adapt", eA, {
      tPrev: { value: null },
      tLum: { value: null },
      tDepth: { value: null },
      uSunUv: { value: new Ae(0.5, 0.5) },
      uSunOn: { value: 0 },
      uRate: { value: 1 },
      uVisRate: { value: 1 },
      uAspect: { value: 1 },
    }),
    N = a("dirt", tA, { tNoise: { value: t }, uAspect: { value: 16 / 9 } }),
    Q = a(
      "grade",
      nA,
      {
        tScene: { value: null },
        tBloom: { value: y.up[0].texture },
        tBlur: { value: y.down[1].texture },
        tStreak: { value: y.streakB.texture },
        tDirt: { value: y.dirt.texture },
        ...E,
        uSunCol: { value: Mn.color.clone() },
        uSunUv: { value: new Ae(0.5, 0.5) },
        uTime: { value: 0 },
        uAspect: { value: 1 },
        uBloom: { value: g.bloom },
        uDirt: { value: g.dirt },
        uStreak: { value: g.streak },
        uFlare: { value: g.flare },
        uCA: { value: g.ca },
        uVignette: { value: g.vignette },
        uDamage: { value: 0 },
        uLowHealth: { value: 0 },
        uAds: { value: 0 },
        uFlash: { value: 0 },
        uFade: { value: 0 },
        uSaturation: { value: 1 },
        uSunOn: { value: 0 },
        uThunder: { value: 0 },
        uAgxMix: { value: g.agxMix },
      },
      { defines: { LOOK_POWER: g.lookPower.toFixed(3), LOOK_SAT: g.lookSat.toFixed(3) } },
    ),
    K = a("final", iA, {
      tSrc: { value: y.ldr.texture },
      uTexel: { value: new Ae() },
      uTime: { value: 0 },
      uGrain: { value: g.grain },
      uSharpen: { value: g.sharpen },
      uFxaa: { value: 1 },
    }),
    taaM = a("taa", taaFrag, {
      tColor: { value: null },
      tHistory: { value: null },
      tDepth: { value: null },
      uInvViewProj: { value: new Ye() },
      uPrevViewProj: { value: new Ye() },
      uRes: { value: new Ae() },
      uFeedback: { value: 0.1 },
    }),
    blitM = a("blit", blitFrag, { tSrc: { value: null } }),
    ie = new Ye(),
    F = new Ye(),
    X = new Ye(),
    ne = new W(),
    re = new W(),
    $ = !1,
    taaN = 0,
    ta = 0;
  function ue() {
    let oe = Math.max(6, d().volSteps | 0),
      fe = d().name === "test" || d().name === "low" ? 8 : d().name === "ultra" ? 16 : 12;
    H.defines.VOL_STEPS !== oe && ((H.defines.VOL_STEPS = oe), (H.needsUpdate = !0)),
      z.defines.AO_TAPS !== fe && ((z.defines.AO_TAPS = fe), (z.needsUpdate = !0));
  }
  function me(oe, fe) {
    if (
      ((oe = Math.max(8, oe | 0)),
      (fe = Math.max(8, fe | 0)),
      (M.w = oe),
      (M.h = fe),
      (M.hw = Math.max(4, Math.ceil(oe / 2))),
      (M.hh = Math.max(4, Math.ceil(fe / 2))),
      y.scene.setSize(oe, fe),
      y.motion.setSize(oe, fe),
      y.ldr.setSize(oe, fe),
      y.taa[0].setSize(oe, fe),
      y.taa[1].setSize(oe, fe),
      y.final.setSize(oe, fe),
      y.depthCopy)
    ) {
      y.depthCopy.setSize(oe, fe);
      let I = y.depthCopy.depthTexture.image;
      (I.width !== oe || I.height !== fe) &&
        ((I.width = oe), (I.height = fe), (y.depthCopy.depthTexture.needsUpdate = !0));
    }
    for (let I of [y.depthHalf, y.aoA, y.aoB, y.volA, y.volB]) I.setSize(M.hw, M.hh);
    let le = M.hw,
      R = M.hh;
    for (let I = 0; I < b; I++)
      y.down[I].setSize(le, R),
        I < b - 1 && y.up[I].setSize(le, R),
        (le = Math.max(2, le >> 1)),
        (R = Math.max(2, R >> 1));
    y.streakA.setSize(y.down[2].width, y.down[2].height),
      y.streakB.setSize(y.down[2].width, y.down[2].height),
      ($ = !1),
      ue();
  }
  function ee() {
    if (!y.depthCopy) {
      let oe = new Tr(M.w, M.h);
      (oe.type = Zs),
        (oe.minFilter = oe.magFilter = f),
        (y.depthCopy = new si(M.w, M.h, {
          type: u,
          format: _n,
          minFilter: f,
          magFilter: f,
          depthBuffer: !0,
          stencilBuffer: !1,
          depthTexture: oe,
          generateMipmaps: !1,
        })),
        i.setRenderTarget(y.depthCopy),
        i.setClearColor(0, 1),
        i.clear(!0, !0, !1),
        i.setRenderTarget(null);
    }
    return y.depthCopy.depthTexture;
  }
  function B(oe) {
    y.depthCopy && ((w.uniforms.tDepth.value = oe), l(w, y.depthCopy));
  }
  function P({
    hdr: oe,
    camera: fe,
    sun: le,
    dt: R,
    post: I,
    exposure: se,
    time: ae,
    fast: k,
    thunder: ce,
  }) {
    let ve = d(),
      _e = fe.projectionMatrix.elements,
      Te = 1 / _e[0],
      Pe = 1 / _e[5],
      Re = Te / Pe,
      Fe = oe.depthTexture;
    (E.tAdapt.value = y.adapt[m].texture),
      (E.uExposure.value = se),
      (E.uAuto.value = J.autoExposure ? 1 : 0),
      (E.uKey.value = g.key),
      (E.uMinE.value = g.minExposure),
      (E.uMaxE.value = g.maxExposure),
      _ || ((N.uniforms.uAspect.value = 16 / 9), l(N, y.dirt), (_ = !0)),
      (S.uniforms.tDepth.value = Fe),
      (S.uniforms.uNear.value = fe.near),
      (S.uniforms.uFar.value = fe.far),
      l(S, y.depthHalf);
    let ze = 1 / M.hw,
      We = 1 / M.hh,
      Ne = !!ve.ao;
    Ne &&
      (z.uniforms.uTanHalf.value.set(Te, Pe),
      z.uniforms.uTexel.value.set(ze, We),
      (z.uniforms.uAspect.value = Re),
      l(z, y.aoA),
      (O.uniforms.tSrc.value = y.aoA.texture),
      O.uniforms.uDir.value.set(ze, 0),
      l(O, y.aoB),
      (O.uniforms.tSrc.value = y.aoB.texture),
      O.uniforms.uDir.value.set(0, We),
      l(O, y.aoA));
    let dt = (ve.volSteps | 0) > 0;
    if (dt) {
      let be = H.uniforms,
        Oe = e.level && e.level.interiorBoxes && e.level.interiorBoxes[0];
      Oe
        ? (be.uBoxMin.value.copy(Oe.min),
          be.uBoxMax.value.copy(Oe.max),
          (be.uBoxDust.value = g.volInteriorDust))
        : (be.uBoxDust.value = 0);
      let pt = le.shadow && le.shadow.map ? le.shadow.map.texture : null;
      (be.tShadow.value = pt),
        (be.uHasShadow.value = pt ? 1 : 0),
        pt && be.uShadowMatrix.value.copy(le.shadow.matrix),
        be.uCamWorld.value.copy(fe.matrixWorld),
        be.uCamPos.value.setFromMatrixPosition(fe.matrixWorld),
        be.uTanHalf.value.set(Te, Pe),
        (be.uFarZ.value = fe.far);
      let ut = le.intensity * g.volSunScale;
      be.uSunRad.value.set(le.color.r * ut, le.color.g * ut, le.color.b * ut);
      let nn = g.volAmbient * (1 + ce * 1.5);
      be.uAmb.value.set(en.fog.r * nn, en.fog.g * nn, en.fog.b * nn),
        l(H, y.volA),
        (q.uniforms.tSrc.value = y.volA.texture),
        q.uniforms.uDir.value.set(ze, 0),
        l(q, y.volB),
        (q.uniforms.tSrc.value = y.volB.texture),
        q.uniforms.uDir.value.set(0, We),
        l(q, y.volA);
    }
    let xe;
    if (Ne || dt) {
      let be = U.uniforms;
      (be.tColor.value = oe.texture),
        (be.tDepth.value = Fe),
        be.uHalfRes.value.set(M.hw, M.hh),
        (be.uNear.value = fe.near),
        (be.uFar.value = fe.far),
        (be.uAoOn.value = Ne ? 1 : 0),
        (be.uVolOn.value = dt ? 1 : 0),
        l(U, y.scene);
      xe = y.scene.texture;
    } else xe = oe.texture;
    ie.multiplyMatrices(fe.projectionMatrix, fe.matrixWorldInverse);
    if (ve.name !== "test" && ve.name !== "low" && !(e.params && e.params.taa === "0") && $ && R > 0) {
      let be = taaM.uniforms;
      (be.tColor.value = xe),
        (be.tHistory.value = y.taa[ta].texture),
        (be.tDepth.value = Fe),
        be.uInvViewProj.value.copy(X.copy(ie).invert()),
        be.uPrevViewProj.value.copy(F),
        be.uRes.value.set(M.w, M.h),
        (be.uFeedback.value = taaN === 0 ? 0 : g.taaFeedback),
        l(taaM, y.taa[1 - ta]),
        (xe = y.taa[1 - ta].texture),
        (ta = 1 - ta),
        taaN++;
    }
    if (ve.motionBlur && $ && R > 0) {
      let be = T.uniforms;
      (be.tColor.value = xe),
        (be.tDepth.value = Fe),
        be.uInvViewProj.value.copy(X.copy(ie).invert()),
        be.uPrevViewProj.value.copy(F),
        (be.uShutter.value = Math.min(0.5, 1 / 190 / Math.max(R, 0.001))),
        be.uRes.value.set(M.w, M.h),
        l(T, y.motion),
        (xe = y.motion.texture);
    }
    if ((F.copy(ie), ($ = !0), ve.bloom)) {
      let be = xe,
        Oe = M.w,
        pt = M.h;
      for (let bt = 0; bt < b; bt++)
        (D.uniforms.tSrc.value = be),
          D.uniforms.uTexel.value.set(1 / Oe, 1 / pt),
          (D.uniforms.uFirst.value = bt === 0 ? 1 : 0),
          l(D, y.down[bt]),
          (be = y.down[bt].texture),
          (Oe = y.down[bt].width),
          (pt = y.down[bt].height);
      let ut = y.down[b - 1];
      for (let bt = b - 2; bt >= 0; bt--)
        (C.uniforms.tLow.value = ut.texture),
          (C.uniforms.tHigh.value = y.down[bt].texture),
          C.uniforms.uTexel.value.set(1 / ut.width, 1 / ut.height),
          l(C, y.up[bt]),
          (ut = y.up[bt]);
      let nn = 1 / y.streakA.width;
      (G.uniforms.tSrc.value = y.down[2].texture),
        G.uniforms.uDir.value.set(nn * 1.5, 0),
        (G.uniforms.uThreshold.value = g.streakThreshold),
        l(G, y.streakA),
        (G.uniforms.tSrc.value = y.streakA.texture),
        G.uniforms.uDir.value.set(nn * 5, 0),
        (G.uniforms.uThreshold.value = 0),
        l(G, y.streakB);
    }
    ne.copy(Mn.dir).multiplyScalar(500).add(re.setFromMatrixPosition(fe.matrixWorld)).project(fe),
      fe.getWorldDirection(re);
    let Ie = re.dot(Mn.dir) > 0.05,
      Be = Math.max(Math.abs(ne.x), Math.abs(ne.y)),
      Xe = Ie ? 1 - Math.min(1, Math.max(0, (Be - 1) / 0.3)) : 0,
      Me = ne.x * 0.5 + 0.5,
      we = ne.y * 0.5 + 0.5;
    {
      let be = j.uniforms,
        Oe = y.adapt[m],
        pt = y.adapt[1 - m];
      (be.tPrev.value = Oe.texture),
        (be.tLum.value = ve.bloom ? y.down[b - 1].texture : xe),
        (be.tDepth.value = Fe),
        be.uSunUv.value.set(Me, we),
        (be.uSunOn.value = Xe),
        (be.uAspect.value = Re);
      let ut = A < 2 || k;
      (be.uRate.value = ut ? (A < 2 ? 1 : 0.6) : 1 - Math.exp(-R / g.adaptTau)),
        (be.uVisRate.value = ut ? 1 : 1 - Math.exp(-R / 0.12)),
        l(j, pt),
        (m = 1 - m),
        A++;
    }
    {
      let be = Q.uniforms;
      (be.tScene.value = xe),
        (E.tAdapt.value = y.adapt[m].texture),
        be.uSunUv.value.set(Me, we),
        (be.uSunOn.value = Xe),
        (be.uAspect.value = Re),
        (be.uTime.value = ae),
        (be.uBloom.value = ve.bloom ? g.bloom : 0),
        (be.uDirt.value = ve.bloom ? g.dirt : 0),
        (be.uStreak.value = ve.bloom ? g.streak : 0),
        (be.uFlare.value = g.flare),
        (be.uAgxMix.value = g.agxMix),
        (be.uCA.value = g.ca),
        (be.uVignette.value = g.vignette),
        (be.uDamage.value = V(I.damage)),
        (be.uLowHealth.value = V(I.lowHealth)),
        (be.uAds.value = V(I.ads)),
        (be.uFlash.value = V(I.flash)),
        (be.uFade.value = V(I.fade)),
        (be.uSaturation.value = Number.isFinite(I.saturation) ? I.saturation : 1),
        l(Q, y.ldr);
    }
    {
      let be = K.uniforms;
      be.uTexel.value.set(1 / M.w, 1 / M.h),
        (be.uTime.value = ae),
        (be.uGrain.value = g.grain),
        (be.uSharpen.value = g.sharpen);
      if (M.w === i.domElement.width && M.h === i.domElement.height) l(K, null);
      else (l(K, y.final), (blitM.uniforms.tSrc.value = y.final.texture), l(blitM, null));
    }
  }
  let V = (oe) => (oe > 0 ? (oe < 1 ? oe : 1) : 0);
  function Y() {
    for (let fe of r) fe.dispose();
    let oe = [
      y.scene,
      y.motion,
      y.ldr,
      y.depthHalf,
      y.aoA,
      y.aoB,
      y.volA,
      y.volB,
      y.streakA,
      y.streakB,
      y.dirt,
      ...y.taa,
      y.final,
      ...y.down,
      ...y.up,
      ...y.adapt,
    ];
    y.depthCopy && oe.push(y.depthCopy);
    for (let fe of oe) fe.dispose();
  }
  let L = new Uint16Array(4);
  function Z() {
    try {
      i.readRenderTargetPixels(y.adapt[m], 0, 0, 1, 1, L);
      let oe = P0.fromHalfFloat(L[0]),
        fe = Math.min(
          g.maxExposure,
          Math.max(g.minExposure, Math.pow(g.key / Math.max(oe, 1e-4), 0.85)),
        );
      return {
        lum: +oe.toFixed(4),
        auto: +fe.toFixed(3),
        sunVis: +P0.fromHalfFloat(L[1]).toFixed(2),
      };
    } catch {
      return null;
    }
  }
  let J = {
    readAdapt: Z,
    run: P,
    resize: me,
    copyDepth: B,
    ensureDepthCopy: ee,
    applyQuality: ue,
    dispose: Y,
    materials: r,
    rt: y,
    size: M,
    TUNE: g,
    autoExposure: !0,
    pass: l,
    quad: s,
    fsCam: o,
  };
  return J;
}
var Jy = 2,
  Ky = 1;
async function Hg(i) {
  let e = i.params || {},
    t = document.getElementById("view"),
    n = new gf({
      canvas: t,
      antialias: !1,
      powerPreference: "high-performance",
      alpha: !1,
      depth: !0,
      stencil: !1,
    });
  (n.outputColorSpace = Vn),
    (n.toneMapping = ys),
    (n.toneMappingExposure = 1),
    (n.shadowMap.enabled = !0),
    (n.shadowMap.type = gc),
    (n.shadowMap.autoUpdate = !1),
    (n.autoClear = !1),
    (n.info.autoReset = !1),
    n.setClearColor(0, 1);
  let s = n.getContext(),
    o = { post: !1, shadow: !1, sky: !1, other: 0 };
  n.debug.onShaderError = (ie, F, X, ne) => {
    let re = "",
      $ = "";
    try {
      (re = ie.getShaderSource(ne) || ""),
        ($ =
          (ie.getShaderInfoLog(ne) || "") +
          " " +
          (ie.getShaderInfoLog(X) || "") +
          " " +
          (ie.getProgramInfoLog(F) || ""));
    } catch {}
    let ue = "material";
    re.includes(Bg)
      ? ((o.post = !0), (ue = "post pass " + (re.match(/SALTLINE_POST (\S+)/) || [])[1]))
      : re.includes("SALTLINE_SKY")
        ? ((o.sky = !0), (ue = "sky"))
        : re.includes(Yy)
          ? ((o.shadow = !0), (ue = "material (soft shadow chunk active)"))
          : o.other++,
      console.error(`[render] shader error in ${ue}: ${$.trim().slice(0, 700)}`);
  };
  let r = new ir(),
    a = new Wn(Pi.fov, 16 / 9, 0.08, 900);
  a.layers.set(vf), (a.rotation.order = "YXZ"), r.add(a);
  let l = new Wn(Pi.viewFov, 16 / 9, 0.01, 10);
  l.layers.set(zc);
  let c = Oy(),
    u = Hy(c);
  r.add(u.mesh);
  let h = new W0(Mn.color, Mn.intensity);
  (h.name = "sun"), (h.castShadow = !0);
  let f = Gy(h, new W(-41, -0.2, -33), new W(37, 32, 31), new W(-41, -3, -64), new W(72, 36, 34)),
    p = () => Math.min(i.quality.shadow || 2048, n.capabilities.maxTextureSize);
  h.shadow.mapSize.set(p(), p()),
    (h.shadow.bias = -12e-5),
    (h.shadow.normalBias = 0.02),
    (h.shadow.radius = 1),
    (h.shadow.autoUpdate = !0),
    r.add(h, h.target);
  let d = !1;
  try {
    d = qy(f, { taps: i.quality.name === "low" ? 10 : 16, searchTaps: 8 });
  } catch (ie) {
    console.warn("[render] soft shadows unavailable: " + ie);
  }
  let v = 6,
    g = [];
  for (let ie = 0; ie < v; ie++) {
    let F = new Qr(16777215, 0, 12, 2);
    (F.userData = { busy: !1, ttl: 0, dur: 0, peak: 0, persistent: !1 }), r.add(F), g.push(F);
  }
  let x = {
      flash(ie, F = 16763008, X = 30, ne = 10, re = 0.06) {
        let $ =
          g.find((ue) => !ue.userData.busy) ||
          g
            .filter((ue) => !ue.userData.persistent)
            .sort((ue, me) => ue.userData.ttl - me.userData.ttl)[0];
        $ &&
          ($.position.copy(ie),
          $.color.set(F),
          ($.distance = ne),
          ($.intensity = X),
          Object.assign($.userData, { busy: !0, ttl: re, dur: re, peak: X, persistent: !1 }));
      },
      acquire() {
        let ie = g.find((F) => !F.userData.busy);
        return ie
          ? ((ie.userData.busy = !0),
            (ie.userData.persistent = !0),
            (ie.intensity = 0),
            {
              light: ie,
              release() {
                (ie.userData.busy = !1), (ie.userData.persistent = !1), (ie.intensity = 0);
              },
            })
          : null;
      },
      update(ie) {
        for (let F of g) {
          let X = F.userData;
          X.busy &&
            !X.persistent &&
            ((X.ttl -= ie),
            X.ttl <= 0
              ? ((X.busy = !1), (F.intensity = 0))
              : (F.intensity = X.peak * (X.ttl / X.dur)));
        }
      },
    },
    y = null;
  try {
    (y = Vy(n, u)), (r.environment = y.texture), (r.environmentIntensity = Jy);
  } catch (ie) {
    console.error("[render] environment capture failed: " + ((ie && ie.stack) || ie));
  }
  let b = new Tr(4, 4);
  (b.type = Zs), (b.minFilter = b.magFilter = Gn);
  let m = new si(4, 4, {
      type: js,
      format: _n,
      minFilter: Zt,
      magFilter: Zt,
      depthBuffer: !0,
      stencilBuffer: !1,
      depthTexture: b,
      samples: i.quality.msaa | 0,
      generateMipmaps: !1,
    }),
    A = null,
    _ = e.post !== "0";
  if (
    (e.ao === "0" && (i.quality.ao = !1),
    e.vol === "0" && (i.quality.volSteps = 0),
    e.bloom === "0" && (i.quality.bloom = !1),
    e.mb === "1" && (i.quality.motionBlur = !0),
    _)
  )
    try {
      A = jy(n, i, { noiseTex: c });
    } catch (ie) {
      (_ = !1),
        console.error(
          "[render] post chain failed to initialise, using forward fallback: " +
            ((ie && ie.stack) || ie),
        );
    }
  let M = !!(e.shot || e.show),
    E = !1,
    w = { t: 99, power: 0, value: 0 };
  i.events &&
    i.events.on &&
    i.events.on("thunder", (ie) => {
      (w.t = 0), (w.power = Math.min(1, (ie && ie.intensity) || 0.6));
      let F = Math.PI * (0.55 + Math.random() * 0.9);
      u.material.uniforms.uFlashDir.value
        .set(
          Math.cos(F),
          0.35 + Math.random() * 0.3,
          Math.sin(F) * (Math.random() < 0.5 ? -1 : 1),
        )
        .normalize();
    });
  let S = {
    scale: 1,
    enabled: !(e.shot || e.show || e.dynres === "0"),
    acc: 0,
    n: 0,
    settle: 3.5,
    upWait: 4,
    upDelay: 4,
  };
  function z(ie) {
    if (!S.enabled || !_ || ie > 1500) return;
    if (((S.settle -= ie / 1e3), (S.upWait -= ie / 1e3), S.settle > 0)) {
      (S.acc = 0), (S.n = 0);
      return;
    }
    if (((S.acc += ie), S.n++, S.n < 45 && S.acc < 900)) return;
    let F = S.acc / S.n;
    (S.acc = 0), (S.n = 0);
    let X = S.scale;
    if (
      (F > 21.5 && X > 0.6
        ? ((X = F > 45 ? 0.6 : Math.max(0.6, X - (F > 30 ? 0.2 : 0.1))),
          (S.upDelay = Math.min(60, S.upDelay * 2)),
          (S.upWait = S.upDelay))
        : F < 17.4 && X < 1 && S.upWait <= 0
          ? ((X = Math.min(1, X + 0.1)), (S.upWait = 2))
          : F < 17.4 && X >= 1 && (S.upDelay = 4),
      (X = Math.round(X * 10) / 10),
      X <= 0.6 && F > 26)
    ) {
      S.floorHits = (S.floorHits || 0) + 1;
      let ne = { ultra: "high", high: "medium", medium: "low" }[i.quality.name];
      if (S.floorHits >= 2 && ne && Pr[ne]) {
        (S.floorHits = 0),
          (S.scale = 0.8),
          (S.settle = 2),
          (S.upDelay = 4),
          console.log(
            "[render] frame time " +
              F.toFixed(0) +
              " ms at minimum scale: dropping quality to " +
              ne,
          );
        try {
          N.setQuality({ ...Pr[ne] }), i.events.emit("quality:auto", { name: ne });
        } catch {}
        return;
      }
    } else S.floorHits = 0;
    X !== S.scale && ((S.scale = X), (S.settle = 1), N.resize());
  }
  let H = [],
    O = {},
    q = (ie, F) => {
      O[ie] || ((O[ie] = 1), console.error(F));
    },
    U = { calls: 0, tris: 0 },
    T = 0,
    D = 0,
    taaJx = 0,
    taaJy = 0,
    taaJActive = !1;
  function taaHalton(base, index) {
    let f = 0,
      d = 1;
    for (let n = index; n > 0; n = Math.floor(n / base)) (d /= base), (f += d * (n % base));
    return f;
  }
  function taaApplyJitter() {
    let sw = A.size.w,
      sh = A.size.h,
      hx = taaHalton(2, T) - 0.5,
      hy = taaHalton(3, T) - 0.5,
      ox = (hx * 2) / sw,
      oy = (hy * 2) / sh;
    a.projectionMatrix.elements[8] += ox;
    a.projectionMatrix.elements[9] += oy;
    l.projectionMatrix.elements[8] += ox;
    l.projectionMatrix.elements[9] += oy;
    (taaJx += ox), (taaJy += oy), (taaJActive = !0);
  }
  function taaClearJitter() {
    if (!taaJActive) return;
    a.projectionMatrix.elements[8] -= taaJx;
    a.projectionMatrix.elements[9] -= taaJy;
    l.projectionMatrix.elements[8] -= taaJx;
    l.projectionMatrix.elements[9] -= taaJy;
    (taaJx = 0), (taaJy = 0), (taaJActive = !1);
  }
  function C() {
    a.updateMatrixWorld(!0),
      (l.matrixAutoUpdate = !1),
      (l.matrixWorldAutoUpdate = !1),
      l.matrixWorld.copy(a.matrixWorld),
      l.matrixWorldInverse.copy(l.matrixWorld).invert();
  }
  function G() {
    n.toneMapping !== xc && (n.toneMapping = xc),
      (n.toneMappingExposure = 0.6 * N.exposure * (1 - Math.min(1, Math.max(0, N.post.fade)))),
      n.setRenderTarget(null),
      n.clear(),
      (n.shadowMap.needsUpdate = !0),
      n.render(r, a),
      n.clearDepth(),
      n.render(r, l);
  }
  function j(ie) {
    n.toneMapping !== ys && (n.toneMapping = ys),
      (n.toneMappingExposure = 1),
      n.setRenderTarget(m),
      n.clear(!0, !0, !1),
      taaClearJitter(),
      i.quality.name !== "test" &&
        i.quality.name !== "low" &&
        e.taa !== "0" &&
        taaApplyJitter(),
      (i.quality.name === "ultra" || e.shot || (T & 1) === 0 || !h.shadow.map) &&
        (n.shadowMap.needsUpdate = !0),
      n.render(r, a),
      E && (A.copyDepth(b), n.setRenderTarget(m)),
      s.depthRange(0, 0.05);
    let F = r.environmentIntensity,
      X = r.environment,
      ne = N.interiorEnv && i.level && i.level.interiorBoxes && i.level.interiorBoxes[0],
      re = !!(
        ne &&
        ne.min &&
        a.position.x > ne.min.x &&
        a.position.x < ne.max.x &&
        a.position.z > ne.min.z &&
        a.position.z < ne.max.z &&
        a.position.y < ne.max.y
      );
    re && (r.environment = N.interiorEnv),
      (r.environmentIntensity = F * (re ? Ky / Jy : 1) * (N.viewFill || 1.35));
    try {
      n.render(r, l);
    } finally {
      s.depthRange(0, 1), (r.environmentIntensity = F), (r.environment = X);
    }
    A.run({
      hdr: m,
      camera: a,
      sun: h,
      dt: ie,
      post: N.post,
      exposure: N.exposure,
      time: i.time ? i.time.t : T / 60,
      fast: M,
      thunder: w.value,
    });
    taaClearJitter();
    n.setRenderTarget(null);
    if (o.post) throw new Error("a post shader failed to compile");
  }
  let N = {
      renderer: n,
      scene: r,
      camera: a,
      viewCamera: l,
      sun: h,
      sky: u.mesh,
      sunDir: Mn.dir.clone(),
      lightPool: x,
      post: {
        damage: 0,
        lowHealth: 0,
        ads: 0,
        flash: 0,
        fade: 0,
        saturation: 1,
        focusDist: 0,
        shake: 0,
        wet: 1,
      },
      exposure: 1,
      env: y ? y.texture : null,
      interiorEnv: null,
      resolution: new Ae(4, 4),
      depthTextureIsLive: !1,
      tune: A ? A.TUNE : {},
      get advanced() {
        return _;
      },
      get autoExposure() {
        return A ? A.autoExposure : !1;
      },
      set autoExposure(ie) {
        A && (A.autoExposure = !!ie);
      },
      get depthTexture() {
        if (!A) return null;
        E = !0;
        try {
          return A.ensureDepthCopy();
        } catch {
          return null;
        }
      },
      addPrePass(ie) {
        H.push(ie);
      },
      renderWorld(ie, F) {
        let X = n.getRenderTarget(),
          ne = n.shadowMap.needsUpdate,
          re = n.toneMapping,
          $ = n.toneMappingExposure,
          ue = ie.layers.mask;
        ie.layers.disable(zc),
          (n.shadowMap.needsUpdate = !1),
          (n.toneMapping = ys),
          (n.toneMappingExposure = 1);
        try {
          n.setRenderTarget(F), n.clear(), n.render(r, ie);
        } finally {
          (ie.layers.mask = ue),
            n.setRenderTarget(X),
            (n.shadowMap.needsUpdate = ne),
            (n.toneMapping = re),
            (n.toneMappingExposure = $);
        }
      },
      async onLevelReady() {
        n.shadowMap.needsUpdate = !0;
        try {
          K();
        } catch (ie) {
          console.error("[render] interior probe failed: " + ((ie && ie.stack) || ie));
        }
        try {
          if ((_ && n.setRenderTarget(m), await n.compileAsync(r, a), N.interiorEnv)) {
            let ie = r.environment;
            r.environment = N.interiorEnv;
            try {
              n.compile(r, l);
            } finally {
              r.environment = ie;
            }
          }
        } catch {}
        n.setRenderTarget(null), (S.settle = 3.5), (S.acc = 0), (S.n = 0);
      },
      setQuality(ie) {
        i.quality = ie;
        let F = p();
        h.shadow.mapSize.x !== F &&
          (h.shadow.mapSize.set(F, F),
          h.shadow.map && (h.shadow.map.dispose(), (h.shadow.map = null)));
        let X = ie.msaa | 0;
        m.samples !== X && ((m.samples = X), m.dispose()), A && A.applyQuality(), N.resize();
      },
      resize() {
        let ie = Math.max(2, t.clientWidth || window.innerWidth),
          F = Math.max(2, t.clientHeight || window.innerHeight),
          X = Math.min(window.devicePixelRatio || 1, 2),
          ne = i.quality.scale || 1;
        if (_) {
          n.setPixelRatio(X), n.setSize(ie, F, !1);
          let re = ne * S.scale,
            $ = { low: 1e6, medium: 15e5, high: 23e5, ultra: 37e5 }[i.quality.name] || 23e5,
            ue = ie * X * F * X * re * re;
          ue > $ && (re *= Math.sqrt($ / ue));
          let me = Math.max(16, Math.round(ie * X * re)),
            ee = Math.max(16, Math.round(F * X * re));
          m.setSize(me, ee),
            (b.image.width !== me || b.image.height !== ee) &&
              ((b.image.width = me), (b.image.height = ee), (b.needsUpdate = !0)),
            A && A.resize(me, ee),
            N.resolution.set(me, ee);
        } else
          n.setPixelRatio(X * ne),
            n.setSize(ie, F, !1),
            N.resolution.set(Math.round(ie * X * ne), Math.round(F * X * ne));
        (a.aspect = l.aspect = ie / F), a.updateProjectionMatrix(), l.updateProjectionMatrix();
      },
      frame(ie) {
        let F = performance.now();
        D && z(F - D), (D = F), T++, n.info.reset(), x.update(ie);
        let X = i.time ? i.time.t : T / 60;
        (u.material.uniforms.uTime.value = X),
          (w.t += ie),
          (w.value =
            w.t < 0.9
              ? w.power *
                Math.exp(-w.t * 5) *
                (0.55 + 0.45 * Math.sin(w.t * 47) * Math.sin(w.t * 13 + 1)) *
                0.35
              : 0),
          (u.material.uniforms.uFlash.value = Math.max(0, w.value)),
          C();
        for (let ne of H)
          try {
            ne(n, r, a);
          } catch (re) {
            q("pre", "[render] pre-pass threw: " + ((re && re.stack) || re));
          }
        if (_)
          try {
            j(ie);
          } catch (ne) {
            _ = !1;
            taaClearJitter();
            try {
              s.depthRange(0, 1), n.setRenderTarget(null);
            } catch {}
            console.error(
              "[render] advanced pipeline disabled, falling back to forward rendering: " +
                ((ne && ne.stack) || ne),
            ),
              N.resize();
          }
        _ || G(), (U = { calls: n.info.render.calls, tris: n.info.render.triangles });
      },
      stats() {
        let ie = n.info;
        return {
          calls: U.calls,
          tris: U.tris,
          geos: ie.memory.geometries,
          tex: ie.memory.textures,
          programs: ie.programs ? ie.programs.length : 0,
          res: [N.resolution.x, N.resolution.y],
          scale: S.scale,
          advanced: _,
          softShadows: d,
          adapt: A && e.shot ? A.readAdapt() : void 0,
        };
      },
    },
    Q = null;
  function K() {
    let ie = i.level && i.level.interiorBoxes;
    if (!ie || !ie.length) return;
    let F = ie[0],
      X = (F.min.x + F.max.x) / 2,
      ne = (F.min.z + F.max.z) / 2,
      re = F.min.y + Math.min(2.4, (F.max.y - F.min.y) * 0.4);
    if (!Q) {
      let ee = new D0(128, { type: js, generateMipmaps: !1 });
      (Q = { cubeRT: ee, cam: new z0(0.15, 300, ee), pmrem: new ia(n), out: null, bakeKey: "", bakeAt: 0 }),
        Q.cam.layers.set(vf);
    }
    let bk = X.toFixed(2) + "|" + re.toFixed(2) + "|" + ne.toFixed(2),
      tm = performance.now();
    if (Q.bakeKey === bk || (Q.bakeAt && tm - Q.bakeAt < 500)) return;
    (Q.bakeKey = bk), (Q.bakeAt = tm);
    Q.cam.position.set(X, re, ne), Q.cam.updateMatrixWorld(!0);
    let $ = n.toneMapping;
    (n.toneMapping = ys), (u.material.uniforms.uEnv.value = 1), (n.shadowMap.needsUpdate = !0);
    try {
      Q.cam.update(n, r);
    } finally {
      (u.material.uniforms.uEnv.value = 0), (n.toneMapping = $), n.setRenderTarget(null);
    }
    Q.out && Q.out.dispose(),
      (Q.out = Q.pmrem.fromCubemap(Q.cubeRT.texture)),
      (N.interiorEnv = Q.out.texture);
    let ue = 0,
      me = new Set();
    r.traverse((ee) => {
      let B = ee.material ? (Array.isArray(ee.material) ? ee.material : [ee.material]) : null;
      if (B)
        for (let P of B)
          !P ||
            me.has(P) ||
            !P.userData ||
            P.userData.interior !== !0 ||
            !("envMap" in P) ||
            (me.add(P),
            (P.envMap = N.interiorEnv),
            P.userData.keepEnvIntensity || (P.envMapIntensity = Ky),
            (P.needsUpdate = !0),
            ue++);
    }),
      ue && console.log(`[render] interior probe assigned to ${ue} material(s)`);
  }
  (N.captureInteriorProbe = K), N.resize(), window.addEventListener("resize", () => N.resize());
  try {
    let ie = new Qt({ color: 8421504 }),
      F = new Qe(new un(1, 1, 1), ie);
    (F.castShadow = F.receiveShadow = !0), F.position.set(0, 0.5, -3), r.add(F);
    let X = () => {
      C(), _ ? j(0.016) : G();
    };
    try {
      X();
    } catch (ne) {
      _ &&
        ((_ = !1),
        console.error(
          "[render] advanced pipeline failed its self test, using forward fallback: " +
            ((ne && ne.message) || ne),
        ));
    }
    if (o.shadow && d) {
      Xy(),
        (d = !1),
        (o.shadow = !1),
        (n.shadowMap.type = Eh),
        (h.shadow.radius = 2),
        ie.dispose(),
        (F.material = new Qt({ color: 8421505 })),
        console.warn("[render] soft shadow chunk rejected by the driver, using stock PCF");
      try {
        X();
      } catch {
        _ = !1;
      }
    }
    if (
      (o.sky && console.error("[render] sky shader failed to compile"),
      r.remove(F),
      F.geometry.dispose(),
      ie.dispose(),
      F.material.dispose(),
      !_)
    ) {
      try {
        s.depthRange(0, 1), n.setRenderTarget(null);
      } catch {}
      N.resize();
    }
    T = 0;
  } catch (ie) {
    console.error("[render] self test threw: " + ((ie && ie.stack) || ie));
  }
  return N;
}
function sA(i) {
  let e = new wt();
  e.name = "render-showcase";
  let t = (h) => (e.add(h), h),
    n = new ls(0.42, 48, 24);
  for (let h = 0; h < 2; h++)
    for (let f = 0; f < 7; f++) {
      let p = new Qt({
          color: h ? 12170408 : 8006172,
          roughness: 0.06 + f * 0.15,
          metalness: h ? 1 : 0,
        }),
        d = new Qe(n, p);
      d.position.set(-3.6 + f * 1.2, 0.42 + h * 1.05, h * -1.1),
        (d.castShadow = d.receiveShadow = !0),
        t(d);
    }
  let s = [
    ["paint_orange", -5.2, 1.4, 1.3, 1.2, 2.2],
    ["steel_worn", 4.6, 1, 0.9, 1, 1.6],
    ["paint_teal", 5.6, 0.6, 2.4, 0.9, 3.6],
    ["concrete", -2.2, 0.5, 0.5, 2.6, 3.2],
  ];
  for (let [h, f, p, d, v, g] of s) {
    let x = Qi(Wi(p, d, v, 0.03, "bottom"), i.mats.get(h));
    x.position.set(f, 0, g), (x.rotation.y = f * 0.2), t(x);
  }
  for (let h = 0; h < 5; h++) {
    let f = Qi(Wi(0.5, 0.5, 0.5, 0.02, "bottom"), i.mats.get("wood_pallet"));
    f.position.set(0.5 + h * 0.52, 0, 3.4 + (h % 2) * 0.04), t(f);
  }
  {
    let h = Qi(Wi(0.5, 0.5, 0.5, 0.02, "bottom"), i.mats.get("wood_pallet"));
    h.position.set(1.3, 0.5, 3.42), (h.rotation.y = 0.3), t(h);
  }
  let o = i.mats.get("concrete_dirty"),
    r = 9,
    a = 7.5,
    l = [
      [-14, -5.2],
      [-4.7, -1.6],
      [-1.1, 1.9],
      [2.4, 5.6],
      [6.3, 14],
    ];
  for (let [h, f] of l) {
    let p = Qi($e(0.4, a, f - h, "bottom"), o);
    p.position.set(r, 0, (h + f) / 2), t(p);
  }
  {
    let h = Qi($e(0.4, 1.2, 28, "bottom"), o);
    h.position.set(r, a, 0), t(h);
  }
  let c = [
    [-12, 0, -9, 6, 4, 0.3],
    [-12, 0, -3, 6, 4, 0.3],
    [-15, 0, -6, 0.3, 4, 6.3],
    [-12, 4, -6, 6.6, 0.3, 6.6],
  ];
  for (let [h, f, p, d, v, g] of c) {
    let x = Qi($e(d, v, g, "bottom"), i.mats.get("steel_dark"));
    x.position.set(h, f, p), t(x);
  }
  {
    let h = new Qe($e(2.4, 0.06, 0.06), i.mats.emissive(16756832, 14));
    h.position.set(-12, 3.6, -6), t(h);
  }
  {
    let h = new Qe(new ls(0.06, 12, 8), i.mats.emissive(16726560, 30));
    h.position.set(4.6, 1.02, 1.6), t(h);
  }
  return (
    i.scene.add(e),
    {
      cam: [-8.5, 1.7, 4.2],
      target: [3, 1.5, 0.4],
      update: () => {
        let h = i.render.post,
          f = Math.round(i.camera.position.y * 1e3) % 10;
        (h.damage = f === 1 ? 0.8 : 0),
          (h.lowHealth = f === 2 ? 0.85 : 0),
          (h.ads = f === 3 ? 1 : 0),
          (h.flash = f === 4 ? 0.35 : 0),
          (h.fade = f === 5 ? 0.5 : 0);
      },
    }
  );
}
