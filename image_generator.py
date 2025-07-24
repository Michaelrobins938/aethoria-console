import random
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import colorsys
import numpy as np

class ImageGenerator:
    def __init__(self):
        self.width = 512
        self.height = 512
        self.base_image = Image.new('RGB', (self.width, self.height), color='black')
        self.draw = ImageDraw.Draw(self.base_image)

    def generate_image(self, prompt):
        self.base_image = Image.new('RGB', (self.width, self.height), color='black')
        self.draw = ImageDraw.Draw(self.base_image)

        # Parse the prompt
        colors = self.extract_colors(prompt)
        shapes = self.extract_shapes(prompt)
        mood = self.extract_mood(prompt)

        # Generate layers
        background_layer = self.generate_background(colors, mood)
        shape_layer = self.generate_shapes(shapes, colors)
        texture_layer = self.generate_texture(mood)
        text_layer = self.generate_text_overlay(prompt)

        # Compose the final image
        final_image = Image.alpha_composite(background_layer, shape_layer)
        final_image = Image.alpha_composite(final_image, texture_layer)
        final_image = Image.alpha_composite(final_image, text_layer)

        # Apply final adjustments
        final_image = self.apply_filters(final_image, mood)

        return final_image

    def extract_colors(self, prompt):
        color_keywords = {
            'red': (255, 0, 0), 'blue': (0, 0, 255), 'green': (0, 255, 0),
            'yellow': (255, 255, 0), 'purple': (128, 0, 128), 'orange': (255, 165, 0),
            'pink': (255, 192, 203), 'brown': (165, 42, 42), 'gray': (128, 128, 128),
            'white': (255, 255, 255), 'black': (0, 0, 0)
        }
        return [color_keywords[color] for color in color_keywords if color in prompt.lower()] or [random.choice(list(color_keywords.values()))]

    def extract_shapes(self, prompt):
        shape_keywords = ['circle', 'square', 'triangle', 'star', 'spiral', 'line', 'polygon', 'curve']
        return [shape for shape in shape_keywords if shape in prompt.lower()] or random.sample(shape_keywords, 3)

    def extract_mood(self, prompt):
        mood_keywords = {
            'happy': {'brightness': 1.2, 'saturation': 1.3, 'contrast': 1.1},
            'sad': {'brightness': 0.8, 'saturation': 0.7, 'contrast': 0.9},
            'energetic': {'brightness': 1.3, 'saturation': 1.5, 'contrast': 1.2},
            'calm': {'brightness': 0.9, 'saturation': 0.8, 'contrast': 0.8},
            'mysterious': {'brightness': 0.7, 'saturation': 0.6, 'contrast': 1.3}
        }
        for mood, settings in mood_keywords.items():
            if mood in prompt.lower():
                return settings
        return random.choice(list(mood_keywords.values()))

    def generate_background(self, colors, mood):
        background = Image.new('RGBA', (self.width, self.height), (0, 0, 0, 0))
        draw = ImageDraw.Draw(background)

        if len(colors) > 1:
            # Create a gradient background
            for y in range(self.height):
                r = int((1 - y / self.height) * colors[0][0] + (y / self.height) * colors[1][0])
                g = int((1 - y / self.height) * colors[0][1] + (y / self.height) * colors[1][1])
                b = int((1 - y / self.height) * colors[0][2] + (y / self.height) * colors[1][2])
                draw.line([(0, y), (self.width, y)], fill=(r, g, b, 255))
        else:
            # Solid color background with a subtle radial gradient
            center_x, center_y = self.width // 2, self.height // 2
            max_distance = math.sqrt(center_x**2 + center_y**2)
            for x in range(self.width):
                for y in range(self.height):
                    distance = math.sqrt((x - center_x)**2 + (y - center_y)**2)
                    factor = 1 - (distance / max_distance) * 0.3
                    r, g, b = [int(c * factor) for c in colors[0]]
                    draw.point((x, y), fill=(r, g, b, 255))

        return background

    def generate_shapes(self, shapes, colors):
        shape_layer = Image.new('RGBA', (self.width, self.height), (0, 0, 0, 0))
        draw = ImageDraw.Draw(shape_layer)

        for _ in range(random.randint(3, 7)):
            shape = random.choice(shapes)
            color = random.choice(colors)
            x, y = random.randint(0, self.width), random.randint(0, self.height)
            size = random.randint(20, 100)
            rotation = random.uniform(0, 360)

            if shape == 'circle':
                self.draw_circle(draw, x, y, size, color)
            elif shape == 'square':
                self.draw_square(draw, x, y, size, color, rotation)
            elif shape == 'triangle':
                self.draw_triangle(draw, x, y, size, color, rotation)
            elif shape == 'star':
                self.draw_star(draw, x, y, size, color, rotation)
            elif shape == 'spiral':
                self.draw_spiral(draw, x, y, size, color)
            elif shape == 'line':
                self.draw_line(draw, x, y, size, color, rotation)
            elif shape == 'polygon':
                self.draw_polygon(draw, x, y, size, color, rotation)
            elif shape == 'curve':
                self.draw_curve(draw, x, y, size, color)

        return shape_layer

    def draw_circle(self, draw, x, y, size, color):
        draw.ellipse([x-size, y-size, x+size, y+size], fill=color + (200,))

    def draw_square(self, draw, x, y, size, color, rotation):
        square = Image.new('RGBA', (size*2, size*2), (0, 0, 0, 0))
        square_draw = ImageDraw.Draw(square)
        square_draw.rectangle([0, 0, size*2-1, size*2-1], fill=color + (200,))
        rotated_square = square.rotate(rotation, expand=1)
        shape_layer.paste(rotated_square, (x-size, y-size), rotated_square)

    def draw_triangle(self, draw, x, y, size, color, rotation):
        triangle = Image.new('RGBA', (size*2, size*2), (0, 0, 0, 0))
        triangle_draw = ImageDraw.Draw(triangle)
        triangle_draw.polygon([(size, 0), (0, size*2), (size*2, size*2)], fill=color + (200,))
        rotated_triangle = triangle.rotate(rotation, expand=1)
        shape_layer.paste(rotated_triangle, (x-size, y-size), rotated_triangle)

    def draw_star(self, draw, x, y, size, color, rotation):
        star = Image.new('RGBA', (size*2, size*2), (0, 0, 0, 0))
        star_draw = ImageDraw.Draw(star)
        points = []
        for i in range(10):
            angle = math.pi / 5 * i
            distance = size if i % 2 == 0 else size / 2
            point_x = size + distance * math.cos(angle)
            point_y = size + distance * math.sin(angle)
            points.append((point_x, point_y))
        star_draw.polygon(points, fill=color + (200,))
        rotated_star = star.rotate(rotation, expand=1)
        shape_layer.paste(rotated_star, (x-size, y-size), rotated_star)

    def draw_spiral(self, draw, x, y, size, color):
        theta = 0
        spiral_points = []
        while theta < 8 * math.pi:
            r = theta * size / (8 * math.pi)
            point_x = x + r * math.cos(theta)
            point_y = y + r * math.sin(theta)
            spiral_points.append((point_x, point_y))
            theta += 0.1
        draw.line(spiral_points, fill=color + (200,), width=2)

    def draw_line(self, draw, x, y, size, color, rotation):
        angle = math.radians(rotation)
        end_x = x + size * math.cos(angle)
        end_y = y + size * math.sin(angle)
        draw.line([x, y, end_x, end_y], fill=color + (200,), width=3)

    def draw_polygon(self, draw, x, y, size, color, rotation):
        num_sides = random.randint(5, 8)
        polygon = Image.new('RGBA', (size*2, size*2), (0, 0, 0, 0))
        polygon_draw = ImageDraw.Draw(polygon)
        points = []
        for i in range(num_sides):
            angle = 2 * math.pi * i / num_sides
            point_x = size + size * math.cos(angle)
            point_y = size + size * math.sin(angle)
            points.append((point_x, point_y))
        polygon_draw.polygon(points, fill=color + (200,))
        rotated_polygon = polygon.rotate(rotation, expand=1)
        shape_layer.paste(rotated_polygon, (x-size, y-size), rotated_polygon)

    def draw_curve(self, draw, x, y, size, color):
        control_points = [
            (x, y),
            (x + random.randint(-size, size), y + random.randint(-size, size)),
            (x + random.randint(-size, size), y + random.randint(-size, size)),
            (x + random.randint(-size, size), y + random.randint(-size, size))
        ]
        draw.line(self.bezier_curve(control_points, 100), fill=color + (200,), width=2)

    def bezier_curve(self, points, num_steps):
        curve_points = []
        for i in range(num_steps):
            t = i / (num_steps - 1)
            x = (1-t)**3 * points[0][0] + 3*(1-t)**2*t * points[1][0] + 3*(1-t)*t**2 * points[2][0] + t**3 * points[3][0]
            y = (1-t)**3 * points[0][1] + 3*(1-t)**2*t * points[1][1] + 3*(1-t)*t**2 * points[2][1] + t**3 * points[3][1]
            curve_points.append((x, y))
        return curve_points

    def generate_texture(self, mood):
        texture_layer = Image.new('RGBA', (self.width, self.height), (0, 0, 0, 0))
        texture_draw = ImageDraw.Draw(texture_layer)

        # Create noise texture
        for x in range(self.width):
            for y in range(self.height):
                noise = random.randint(0, 25)
                texture_draw.point((x, y), fill=(noise, noise, noise, random.randint(0, 100)))

        # Add some random lines for texture
        for _ in range(50):
            start = (random.randint(0, self.width), random.randint(0, self.height))
            end = (random.randint(0, self.width), random.randint(0, self.height))
            texture_draw.line([start, end], fill=(255, 255, 255, random.randint(0, 50)), width=1)

        # Apply blur to soften the texture
        texture_layer = texture_layer.filter(ImageFilter.GaussianBlur(radius=2))

        return texture_layer

    def generate_text_overlay(self, prompt):
        text_layer = Image.new('RGBA', (self.width, self.height), (0, 0, 0, 0))
        text_draw = ImageDraw.Draw(text_layer)

        font_size = 20
        font = ImageFont.truetype("arial.ttf", font_size)

        words = prompt.split()
        for word in words:
            x = random.randint(0, self.width - font_size * len(word))
            y = random.randint(0, self.height - font_size)
            angle = random.uniform(-30, 30)
            text_image = Image.new('RGBA', (font_size * len(word), font_size * 2), (0, 0, 0, 0))
            text_draw_temp = ImageDraw.Draw(text_image)
            text_draw_temp.text((0, 0), word, font=font, fill=(255, 255, 255, 128))
            rotated_text = text_image.rotate(angle, expand=1)
            text_layer.paste(rotated_text, (x, y), rotated_text)

        return text_layer

    def apply_filters(self, image, mood):
        # Apply mood-based color adjustments
        enhancer = ImageEnhance.Brightness(image)
        image = enhancer.enhance(mood['brightness'])

        enhancer = ImageEnhance.Color(image)
        image = enhancer.enhance(mood['saturation'])

        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(mood['contrast'])

        # Apply a subtle vignette effect
        vignette = self.create_vignette(image.size)
        image = Image.composite(image, Image.new('RGB', image.size, 'black'), vignette)

        return image

    def create_vignette(self, size):
        vignette = Image.new('L', size, 255)
        draw = ImageDraw.Draw(vignette)
        
        width, height = size
        for offset, fill in ((0, 0), (3, 16), (13, 64), (20, 128)):
            left = top = offset
            right = width - offset
            bottom = height - offset
            draw.ellipse([left, top, right, bottom], fill=fill)

        return vignette

    def color_palette_from_image(self, image, num_colors=5):
        # Extract a color palette from the generated image
        image = image.copy()
        image = image.convert('RGB')
        image = image.resize((50, 50))  # Resize for faster processing

        pixels = list(image.getdata())
        pixel_count = len(pixels)
        
        color_counts = {}
        for count, color in pixels:
            if color in color_counts:
                color_counts[color] += count
            else:
                color_counts[color] = count

        sorted_colors = sorted(color_counts.items(), key=lambda x: x[1], reverse=True)
        palette = [color for color, count in sorted_colors[:num_colors]]

        return palette

# This completes the image_generator.py file with complex image generation techniques.