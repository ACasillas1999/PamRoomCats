<?php
// api/save_score.php - Guardar resultado de partida y actualizar estadísticas
require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['success' => false, 'error' => 'Datos inválidos']);
    exit;
}

$playerName = trim($input['player_name'] ?? 'Pam');
if (empty($playerName)) $playerName = 'Pam';

$thesisProgress = floatval($input['thesis_progress'] ?? 0);
$timeSeconds = floatval($input['time_seconds'] ?? 0);
$chapterReached = intval($input['chapter_reached'] ?? 1);
$won = !empty($input['won']) ? 1 : 0;
$catsAttended = intval($input['cats_attended'] ?? 0);

$fed = intval($input['stats']['fed'] ?? 0);
$litter = intval($input['stats']['litter'] ?? 0);
$played = intval($input['stats']['played'] ?? 0);
$petted = intval($input['stats']['petted'] ?? 0);
$keyboardIncidents = intval($input['stats']['keyboard_incidents'] ?? 0);

try {
    $pdo->beginTransaction();

    // Obtener o registrar jugador
    $stmt = $pdo->prepare('SELECT id FROM players WHERE username = ?');
    $stmt->execute([$playerName]);
    $player = $stmt->fetch();

    if ($player) {
        $playerId = $player['id'];
    } else {
        $stmtInsert = $pdo->prepare('INSERT INTO players (username) VALUES (?)');
        $stmtInsert->execute([$playerName]);
        $playerId = $pdo->lastInsertId();
    }

    // Insertar puntuación
    $stmtScore = $pdo->prepare('
        INSERT INTO scores (player_id, player_name, thesis_progress, time_seconds, chapter_reached, won, cats_attended)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ');
    $stmtScore->execute([$playerId, $playerName, $thesisProgress, $timeSeconds, $chapterReached, $won, $catsAttended]);

    // Actualizar estadísticas globales acumuladas
    $stmtStats = $pdo->prepare('
        UPDATE stats 
        SET times_fed = times_fed + ?,
            times_litter_cleaned = times_litter_cleaned + ?,
            times_played = times_played + ?,
            times_petted = times_petted + ?,
            keyboard_incidents = keyboard_incidents + ?
        WHERE id = 1
    ');
    $stmtStats->execute([$fed, $litter, $played, $petted, $keyboardIncidents]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Puntuación guardada con éxito',
        'score_id' => $pdo->lastInsertId()
    ]);
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
