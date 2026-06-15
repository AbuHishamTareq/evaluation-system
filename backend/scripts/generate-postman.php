<?php

/**
 * Generate a Postman v2.1 Collection from Laravel API routes.
 *
 * Usage: php scripts/generate-postman.php
 * Output: postman/PHC_Evaluation_System.postman_collection.json
 */

// Read routes JSON from artisan route:list
$routesJson = shell_exec('php artisan route:list --path=api/v1 --json 2>/dev/null');

if (! $routesJson) {
    echo "Error: Could not read routes. Make sure you're in the Laravel project root.\n";
    exit(1);
}

$routes = json_decode($routesJson, true);

if (! $routes) {
    echo "Error: Failed to parse routes JSON.\n";
    exit(1);
}

// Build Postman collection structure
$collection = [
    'info' => [
        'name' => 'PHC Evaluation System API',
        'description' => 'API documentation for the PHC Evaluation System. This collection includes all available API v1 endpoints.',
        'schema' => 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
        '_exporter_id' => 'phc-evaluation-system',
    ],
    'variable' => [
        [
            'key' => 'base_url',
            'value' => 'http://localhost:8000',
            'type' => 'string',
        ],
        [
            'key' => 'token',
            'value' => '',
            'type' => 'string',
        ],
    ],
    'item' => [],
];

// Group routes by their URI prefix (first segment after api/v1/)
$grouped = [];
foreach ($routes as $route) {
    $uri = $route['uri'];
    // Extract the group prefix (e.g., "auth", "staff", "questions")
    $parts = explode('/', $uri);
    // parts[0] = api, parts[1] = v1, parts[2] = group
    $group = $parts[2] ?? 'misc';

    // Normalize group names
    $groupName = match ($group) {
        'action-plans' => 'Action Plans',
        'team-codes' => 'Team Codes',
        'clinic-assignments' => 'Clinic Assignments',
        'educational-degrees' => 'Educational Degrees',
        'change-password', 'reset-password' => null, // These are under "auth" prefix in the URI
        default => ucfirst(str_replace('-', ' ', $group)),
    };

    // Handle sub-groups within auth
    if ($group === 'auth') {
        $groupName = 'Authentication';
    }

    // Handle classification sub-groups
    if (in_array($group, ['fields', 'specialties', 'ranks', 'categories', 'classifications'])) {
        $groupName = 'Classification - '.ucfirst(str_replace('-', ' ', $group));
    }

    if ($groupName === null) {
        continue;
    }

    $grouped[$groupName][] = $route;
}

// Build collection items
$folders = [];
foreach ($grouped as $groupName => $routes) {
    $items = [];

    foreach ($routes as $route) {
        $uri = $route['uri'];
        $action = $route['action'];
        $middleware = $route['middleware'] ?? [];
        $methods = explode('|', $route['method']);

        // Determine if the route requires authentication
        $requiresAuth = false;
        foreach ($middleware as $mw) {
            if (str_contains($mw, 'auth') || str_contains($mw, 'sanctum')) {
                $requiresAuth = true;
                break;
            }
        }

        // Convert Laravel route params to Postman syntax: {param} -> :param
        $postmanUri = preg_replace('/\{(\w+)\??\}/', ':$1', $uri);

        // Extract a readable name from the action
        $actionParts = explode('@', $action);
        $methodName = end($actionParts);
        $requestName = ucwords(str_replace('-', ' ', $methodName));

        // For each HTTP method (skip HEAD variants)
        foreach ($methods as $method) {
            if ($method === 'HEAD') {
                continue;
            }

            $request = [
                'name' => $requestName,
                'request' => [
                    'method' => strtoupper($method),
                    'header' => [
                        [
                            'key' => 'Accept',
                            'value' => 'application/json',
                            'type' => 'text',
                        ],
                        [
                            'key' => 'Content-Type',
                            'value' => 'application/json',
                            'type' => 'text',
                        ],
                    ],
                    'url' => [
                        'raw' => '{{base_url}}/'.$postmanUri,
                        'host' => ['{{base_url}}'],
                        'path' => explode('/', $postmanUri),
                    ],
                    'description' => $action,
                ],
            ];

            // Add Authorization header if route requires auth
            if ($requiresAuth) {
                $request['request']['header'][] = [
                    'key' => 'Authorization',
                    'value' => 'Bearer {{token}}',
                    'type' => 'text',
                ];
            }

            // Parse URL parameters
            $urlParams = [];
            if (preg_match_all('/\{(\w+)\??\}/', $uri, $matches)) {
                foreach ($matches[1] as $param) {
                    $urlParams[] = [
                        'key' => $param,
                        'value' => '',
                        'description' => "The {$param} ID",
                    ];
                }
            }

            if (! empty($urlParams)) {
                $request['request']['url']['variable'] = $urlParams;
            }

            $items[] = $request;
        }
    }

    if (! empty($items)) {
        $folders[] = [
            'name' => $groupName,
            'item' => $items,
        ];
    }
}

$collection['item'] = $folders;

// Add authentication example folder at the top
$authFolder = [
    'name' => '🔐 Authentication',
    'item' => [],
];

// Check if we have auth routes already in the grouped array
foreach ($collection['item'] as $idx => $folder) {
    if ($folder['name'] === 'Authentication') {
        $authFolder['item'] = $folder['item'];
        unset($collection['item'][$idx]);
        break;
    }
}

// Re-index and prepend auth folder
$collection['item'] = array_values($collection['item']);
array_unshift($collection['item'], $authFolder);

// Write the collection file
$outputDir = __DIR__.'/../postman';
if (! is_dir($outputDir)) {
    mkdir($outputDir, 0755, true);
}

$outputFile = $outputDir.'/PHC_Evaluation_System.postman_collection.json';
$json = json_encode($collection, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

if (file_put_contents($outputFile, $json)) {
    $routeCount = count($routes);
    $folderCount = count($folders);
    echo "✅ Postman collection generated successfully!\n";
    echo "   File: {$outputFile}\n";
    echo "   Routes: {$routeCount}\n";
    echo "   Folders: {$folderCount}\n";
} else {
    echo "❌ Error: Failed to write Postman collection file.\n";
    exit(1);
}

// Also generate an environment file
$environment = [
    'name' => 'PHC Evaluation System - Local',
    'values' => [
        [
            'key' => 'base_url',
            'value' => 'http://localhost:8000',
            'type' => 'default',
            'enabled' => true,
        ],
        [
            'key' => 'token',
            'value' => '',
            'type' => 'secret',
            'enabled' => true,
        ],
        [
            'key' => 'api_prefix',
            'value' => 'api/v1',
            'type' => 'default',
            'enabled' => true,
        ],
    ],
];

$envFile = $outputDir.'/PHC_Evaluation_System.postman_environment.json';
if (file_put_contents($envFile, json_encode($environment, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES))) {
    echo "   Environment: {$envFile}\n";
} else {
    echo "   ⚠️  Failed to write environment file.\n";
}
