<?php

test('the application shell references the complete logo set', function () {
    $this->get(route('login'))
        ->assertOk()
        ->assertSee('<meta name="theme-color" content="#4F9A46">', false)
        ->assertSee('href="/favicon-32x32.png"', false)
        ->assertSee('href="/favicon-16x16.png"', false)
        ->assertSee('href="/favicon.ico"', false)
        ->assertSee('href="/apple-touch-icon.png"', false)
        ->assertSee('href="/site.webmanifest"', false);
});

test('the logo files have the expected dimensions', function (
    string $filename,
    ?array $expectedDimensions,
) {
    $path = public_path($filename);

    expect($path)->toBeFile();

    if ($expectedDimensions !== null) {
        $imageSize = getimagesize($path);

        expect([$imageSize[0], $imageSize[1]])->toBe($expectedDimensions);
    }
})->with([
    'favicon ico' => ['favicon.ico', null],
    'favicon 16' => ['favicon-16x16.png', [16, 16]],
    'favicon 32' => ['favicon-32x32.png', [32, 32]],
    'apple touch icon' => ['apple-touch-icon.png', [180, 180]],
    'android icon 192' => ['android-chrome-192x192.png', [192, 192]],
    'android icon 512' => ['android-chrome-512x512.png', [512, 512]],
]);

test('the web manifest uses the supplied application icons', function () {
    $manifest = json_decode(
        file_get_contents(public_path('site.webmanifest')),
        true,
        flags: JSON_THROW_ON_ERROR,
    );

    expect($manifest)
        ->name->toBe('Sedjati Learning Championship')
        ->short_name->toBe('SLC 2026')
        ->theme_color->toBe('#4F9A46')
        ->icons->toHaveCount(2)
        ->icons->{0}->src->toBe('/android-chrome-192x192.png')
        ->icons->{1}->src->toBe('/android-chrome-512x512.png');
});
