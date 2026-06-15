<?php

return [

    /*
    |--------------------------------------------------------------------------
    | DomPDF Configuration
    |--------------------------------------------------------------------------
    |
    | Configure DomPDF to work correctly with PHP 8.5+ and the current font setup.
    | Uses core PDF fonts (Helvetica) to avoid TTF font loading issues with php-font-lib.
    |
    */

    'show_warnings' => env('DOMPDF_SHOW_WARNINGS', false),

    'show_admin_errors' => env('DOMPDF_SHOW_ADMIN_ERRORS', false),

    /*
    |--------------------------------------------------------------------------
    | Default Paper Size
    |--------------------------------------------------------------------------
    */
    'default_paper_size' => 'a4',

    /*
    |--------------------------------------------------------------------------
    | Default Font
    |--------------------------------------------------------------------------
    |
    | Use the built-in core PDF font (Helvetica) to avoid the
    | php-font-lib ord("") deprecation in PHP 8.5+.
    | 'sans-serif' is mapped to Helvetica in installed-fonts.dist.json.
    |
    */
    'default_font' => 'sans-serif',

    /*
    |--------------------------------------------------------------------------
    | Font Dir
    |--------------------------------------------------------------------------
    */
    'font_dir' => env('DOMPDF_FONT_DIR', storage_path('fonts')),

    /*
    |--------------------------------------------------------------------------
    | Font Cache
    |--------------------------------------------------------------------------
    */
    'font_cache' => env('DOMPDF_FONT_CACHE', storage_path('fonts')),

    /*
    |--------------------------------------------------------------------------
    | Font Height Ratio
    |--------------------------------------------------------------------------
    */
    'font_height_ratio' => env('DOMPDF_FONT_HEIGHT_RATIO', 1.1),

    /*
    |--------------------------------------------------------------------------
    | Enable HTML5 Parser
    |--------------------------------------------------------------------------
    */
    'is_html5_parser_enabled' => true,

    /*
    |--------------------------------------------------------------------------
    | Enable Remote
    |--------------------------------------------------------------------------
    */
    'is_remote_enabled' => env('DOMPDF_REMOTE_ENABLED', false),

    /*
    |--------------------------------------------------------------------------
    | Enable Javascript
    |--------------------------------------------------------------------------
    */
    'is_javascript_enabled' => env('DOMPDF_JS_ENABLED', false),

    /*
    |--------------------------------------------------------------------------
    | Enable Font Subsetting
    |--------------------------------------------------------------------------
    */
    'is_font_subsetting_enabled' => false,

    /*
    |--------------------------------------------------------------------------
    | Debug Mode
    |--------------------------------------------------------------------------
    */
    'debug_png' => env('DOMPDF_DEBUG_PNG', false),
    'debug_keep_temp' => env('DOMPDF_DEBUG_KEEP_TEMP', false),
    'debug_css' => env('DOMPDF_DEBUG_CSS', false),
    'debug_layout' => env('DOMPDF_DEBUG_LAYOUT', false),
    'debug_layout_lines' => env('DOMPDF_DEBUG_LAYOUT_LINES', false),
    'debug_layout_blocks' => env('DOMPDF_DEBUG_LAYOUT_BLOCKS', false),
    'debug_layout_inline' => env('DOMPDF_DEBUG_LAYOUT_INLINE', false),
    'debug_layout_padding_box' => env('DOMPDF_DEBUG_LAYOUT_PADDING_BOX', false),

    /*
    |--------------------------------------------------------------------------
    | PDF Rendering DPI
    |--------------------------------------------------------------------------
    */
    'dpi' => env('DOMPDF_DPI', 96),

    /*
    |--------------------------------------------------------------------------
    | PDF Rendering Callbacks
    |--------------------------------------------------------------------------
    */
    'callbacks' => [],

    /*
    |--------------------------------------------------------------------------
    | PDF Rendering Settings
    |--------------------------------------------------------------------------
    */
    'enable_css_float' => true,
    'enable_html5_parser' => true,

];
