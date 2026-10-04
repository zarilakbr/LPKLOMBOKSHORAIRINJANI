<?php

function httpPost($url, $data, $token = null) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    $headers = ['Content-Type: application/json', 'Accept: application/json'];
    if ($token) {
        $headers[] = 'Authorization: Bearer ' . $token;
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    $res = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    return ['status' => $status, 'body' => json_decode($res, true), 'raw' => $res];
}

function httpGet($url, $token = null) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $headers = ['Accept: application/json'];
    if ($token) {
        $headers[] = 'Authorization: Bearer ' . $token;
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $res = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    return ['status' => $status, 'body' => json_decode($res, true), 'raw' => $res];
}

echo "=== TEST 1: ADMIN LOGIN ===\n";
$adminLogin = httpPost('http://127.0.0.1:8000/api/auth/login', [
    'email' => 'admin@example.test',
    'password' => 'ShoraiAdmin2026!'
]);
echo "Status: {$adminLogin['status']}\n";
echo "Role: " . ($adminLogin['body']['data']['user']['role'] ?? 'none') . "\n";
$adminToken = $adminLogin['body']['data']['token'] ?? null;

echo "\n=== TEST 2: TEACHER LOGIN ===\n";
$teacherLogin = httpPost('http://127.0.0.1:8000/api/auth/login', [
    'email' => 'teacher@example.test',
    'password' => 'ShoraiSensei2026!'
]);
echo "Status: {$teacherLogin['status']}\n";
echo "Role: " . ($teacherLogin['body']['data']['user']['role'] ?? 'none') . "\n";
$teacherToken = $teacherLogin['body']['data']['token'] ?? null;

echo "\n=== TEST 3: TEACHER /api/auth/me ===\n";
$teacherMe = httpGet('http://127.0.0.1:8000/api/auth/me', $teacherToken);
echo "Status: {$teacherMe['status']}\n";
echo "Data: " . json_encode($teacherMe['body']) . "\n";

echo "\n=== TEST 4: TEACHER ENDPOINTS ===\n";
$teacherEndpoints = [
    '/api/teacher/classes',
    '/api/teacher/schedule',
    '/api/teacher/students',
    '/api/teacher/materials',
    '/api/teacher/attendance',
    '/api/teacher/permissions',
    '/api/teacher/notifications',
    '/api/teacher/profile',
];
foreach ($teacherEndpoints as $ep) {
    $res = httpGet('http://127.0.0.1:8000' . $ep, $teacherToken);
    echo "{$ep}: Status {$res['status']}\n";
}

echo "\n=== TEST 5: ADMIN ENDPOINTS ===\n";
$adminEndpoints = [
    '/api/admin/programs',
    '/api/admin/classes',
    '/api/admin/schedules',
    '/api/admin/materials',
    '/api/admin/opportunities',
    '/api/admin/registrations',
    '/api/admin/testimonials',
    '/api/admin/articles',
    '/api/admin/gallery',
    '/api/admin/facilities',
    '/api/admin/faqs',
    '/api/admin/users',
    '/api/admin/activity-logs',
];
foreach ($adminEndpoints as $ep) {
    $res = httpGet('http://127.0.0.1:8000' . $ep, $adminToken);
    echo "{$ep}: Status {$res['status']}\n";
}
