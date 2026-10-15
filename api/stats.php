<?php
// api/stats.php - Obtener estadísticas globales y conteo de partidas
require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

try {
    $stmtStats = $pdo->query('SELECT * FROM stats WHERE id = 1');
    $stats = $stmtStats->fetch() ?: [
        'times_fed' => 0,
        'times_litter_cleaned' => 0,
        'times_played' => 0,
        'times_petted' => 0,
        'keyboard_incidents' => 0
    ];

    $stmtTotals = $pdo->query('
        SELECT 
            COUNT(*) as total_games,
            SUM(CASE WHEN won = 1 THEN 1 ELSE 0 END) as total_wins,
            SUM(cats_attended) as total_cats_attended
        FROM scores
    ');
    $totals = $stmtTotals->fetch();

    echo json_encode([
        'success' => true,
        'stats' => $stats,
        'totals' => $totals
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
