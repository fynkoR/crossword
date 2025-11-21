package com.example.crossword.controller;

import com.example.crossword.dto.dtoGame.GameActionDto;
import com.example.crossword.dto.dtoGame.GameDto;
import com.example.crossword.dto.dtoGame.GameResultDto;
import com.example.crossword.service.GameService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST контроллер для работы с играми
 */
@RestController
@RequestMapping("/games")
public class GameController {

    private static final Logger logger = LoggerFactory.getLogger(GameController.class);
    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    /**
     * Начать новую игру
     * POST /games
     */
    @PostMapping
    public ResponseEntity<GameResultDto> startGame(@RequestBody GameActionDto action) {
        try {
            logger.info("POST /games - Начало новой игры, crosswordId: {}, userId: {}", 
                action.getCrosswordId(), action.getUserId());
            GameResultDto result = gameService.startGame(action);
            logger.info("Игра успешно создана");
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (RuntimeException e) {
            logger.error("Ошибка при создании игры: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Выполнить действие с игрой (универсальный endpoint)
     * POST /games/{id}/action
     * 
     * Поддерживаемые действия:
     * - check: проверить ответ
     * - hint: использовать подсказку
     * - complete: завершить игру
     * - pause: приостановить/возобновить игру
     * - restart: начать игру заново
     * - save: сохранить прогресс
     */
    @PostMapping("/{id}/action")
    public ResponseEntity<GameResultDto> gameAction(@PathVariable Long id, @RequestBody GameActionDto action) {
        try {
            logger.info("POST /games/{}/action - Действие: {}", id, action.getAction());
            GameResultDto result = gameService.handleAction(id, action);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            logger.error("Ошибка при выполнении действия в игре ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Получить игру по ID
     * GET /games/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<GameDto> getGame(@PathVariable Long id) {
        try {
            logger.info("GET /games/{} - Получение игры по ID", id);
            GameDto game = gameService.getGameById(id);
            return ResponseEntity.ok(game);
        } catch (RuntimeException e) {
            logger.warn("Игра с ID {} не найдена", id);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Получить все игры пользователя
     * GET /games/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<GameDto>> getUserGames(@PathVariable Long userId) {
        try {
            List<GameDto> games = gameService.getGamesByUser(userId);
            return ResponseEntity.ok(games);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Удалить игру
     * DELETE /games/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGame(@PathVariable Long id) {
        try {
            logger.info("DELETE /games/{} - Удаление игры", id);
            gameService.deleteGame(id);
            logger.info("Игра с ID {} успешно удалена", id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            logger.error("Ошибка при удалении игры ID {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}
