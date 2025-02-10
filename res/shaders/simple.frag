#version 430 core

struct LightSource {
    vec3 position;
    vec3 color;
};

in layout(location = 0) vec3 normal;
in layout(location = 1) vec2 textureCoordinates;
in layout(location = 2) vec3 fragment_position;

#define number_lights 3
uniform LightSource light_source[number_lights];

uniform layout(location = 6) vec3 camera_position;
uniform layout(location = 7) vec3 ball_position;
uniform layout(location = 8) double ball_radius;

out vec4 color;

float rand(vec2 co) { return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453); }
float dither(vec2 uv) { return (rand(uv)*2.0-1.0) / 256.0; }
vec3 reject(vec3 from, vec3 onto) {
    return from - onto*dot(from, onto)/dot(onto, onto);
}

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
    vec3 specular;

    for (int i = 0; i < number_lights; i++) {
        // Calculate attentuation
        float d = length(light_source[i].position - fragment_position);
        float la = 0.01;
        float lb = 0.005;
        float lc = 0.003;
        float L = 1 / (la + lb*d + lc*pow(d,2));

        // Calculate shadows
        float soft_shadow_radius = float(ball_radius) * 1.3;

        vec3 light_distance = light_source[i].position - fragment_position;
        vec3 ball_distance = ball_position - fragment_position;
        float shadow_strenght = 1.0;
        float rejection_length = length(reject(ball_distance, light_distance));
        
        if (length(ball_distance) <= length(light_distance) && dot(light_distance, ball_distance) >= 0) {
            // Full shadow
            if (rejection_length <= ball_radius)
                shadow_strenght = 0.0;
            // Soft shadow
            else if (rejection_length <= soft_shadow_radius ) {
                float t = (rejection_length - float(ball_radius)) / (soft_shadow_radius - float(ball_radius));
                shadow_strenght = mix(0.0, 1.0, t);
            }
        }

        // Calculate diffuse
        vec3 light_direction = normalize(light_source[i].position - fragment_position);
        float diffuse_intensity = max(dot(light_direction, normal_out), 0.0);
        // vec3 diffuse_color = vec3(255.0, 255.0, 255.0) / 255.0;
        vec3 diffuse_color = light_source[i].color / 255.0;

        diffuse += diffuse_intensity * diffuse_color * L * shadow_strenght;

        // Calculate specular
        vec3 reflect_direction = reflect(-light_direction, normal_out);
        vec3 view_direction = normalize(camera_position - fragment_position);
        float specular_intensity = pow(max(dot(view_direction, reflect_direction), 0.0), 32);
        // vec3 specular_color = vec3(255.0, 255.0, 255.0) / 255.0;
        vec3 specular_color = light_source[i].color / 255.0;

        specular += specular_intensity * specular_color * L * shadow_strenght;
    }

    // Dither
    float noise = dither(textureCoordinates);

    // color = vec4(0.5 * normal + 0.5, 1.0);
    color = vec4(ambient + diffuse + specular + noise, 1.0);
}