<?php
// api/leaderboard.php - Obtener los mejores récords
require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

try {
    // Top victorias ordenadas por menor tiempo
    $stmtWins = $pdo->query('
        SELECT player_name, time_seconds, thesis_progress, chapter_reached, cats_attended, created_at
        FROM scores
        WHERE won = 1
        ORDER BY time_seconds ASC
        LIMIT 10
    ');
    $topWins = $stmtWins->fetchAll();

    // Top intentos (por mayor progreso de tesis alcanzado y mayor tiempo resistido)
    $stmtAttempts = $pdo->query('
        SELECT player_name, time_seconds, thesis_progress, chapter_reached, cats_attended, won, created_at
        FROM scores
        ORDER BY thesis_progress DESC, time_seconds DESC
        LIMIT 10
    ');
    $topAttempts = $stmtAttempts->fetchAll();

    echo json_encode([
        'success' => true,
        'leaderboard' => $topWins,
        'top_attempts' => $topAttempts
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
