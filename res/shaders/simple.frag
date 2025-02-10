#version 430 core

struct LightSource {
    vec3 position;
};

in layout(location = 0) vec3 normal;
in layout(location = 1) vec2 textureCoordinates;
in layout(location = 2) vec3 fragment_position;

#define number_lights 3
uniform LightSource light_source[number_lights];

out vec4 color;

float rand(vec2 co) { return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453); }
float dither(vec2 uv) { return (rand(uv)*2.0-1.0) / 256.0; }

void main()
{
    // Normalize normals 2nd time
    vec3 normal_out = normalize(normal);

    // Ambient
    float ambient_intensity = 0.1;
    vec3 ambient_color = vec3(255.0, 255.0, 255.0);
    vec3 ambient = (ambient_color / 255.0) * ambient_intensity;

    // Diffuse and Specular
    vec3 diffuse;

    for (int i = 0; i < number_lights; i++) {
        // Calculate diffuse
        vec3 light_direction = normalize(light_source[i].position - fragment_position);
        float diffuse_intensity = max(dot(light_direction, normal_out), 0.0);
        vec3 diffuse_color = vec3(255.0, 255.0, 255.0) / 255.0;

        diffuse += diffuse_intensity * diffuse_color;
    }

    // color = vec4(0.5 * normal + 0.5, 1.0);
    color = vec4(ambient + diffuse, 1.0);
}