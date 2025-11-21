package com.example.crossword.controller;

import com.example.crossword.dto.dtoCrossword.CrosswordCreateDto;
import com.example.crossword.dto.dtoCrossword.CrosswordDetailDto;
import com.example.crossword.dto.dtoCrossword.CrosswordDto;
import com.example.crossword.dto.dtoCrossword.CrosswordUpdateDto;
import com.example.crossword.service.CrosswordService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST контроллер для работы с кроссвордами
 */
@RestController
@RequestMapping("/crosswords")
public class CrosswordController {

    private static final Logger logger = LoggerFactory.getLogger(CrosswordController.class);
    private final CrosswordService crosswordService;

    public CrosswordController(CrosswordService crosswordService) {
        this.crosswordService = crosswordService;
    }

    /**
     * Создать новый кроссворд
     * POST /crosswords
     */
    @PostMapping
    public ResponseEntity<CrosswordDto> createCrossword(@RequestBody CrosswordCreateDto crosswordCreateDto) {
        try {
            logger.info("POST /crosswords - Создание кроссворда: {}", crosswordCreateDto.getTitle());
            CrosswordDto createdCrossword = crosswordService.createCrossword(crosswordCreateDto);
            logger.info("Кроссворд успешно создан с ID: {}", createdCrossword.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdCrossword);
        } catch (RuntimeException e) {
            logger.error("Ошибка при создании кроссворда: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Получить кроссворд по ID (базовая информация)
     * GET /crosswords/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<CrosswordDto> getCrosswordById(@PathVariable Long id) {
        try {
            logger.info("GET /crosswords/{} - Получение кроссворда по ID", id);
            CrosswordDto crossword = crosswordService.getCrosswordById(id);
            return ResponseEntity.ok(crossword);
        } catch (RuntimeException e) {
            logger.warn("Кроссворд с ID {} не найден", id);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Получить детальную информацию о кроссворде (включая сетку и слова)
     * GET /crosswords/{id}/detail
     */
    @GetMapping("/{id}/detail")
    public ResponseEntity<CrosswordDetailDto> getCrosswordDetailById(@PathVariable Long id) {
        try {
            CrosswordDetailDto crosswordDetail = crosswordService.getCrosswordDetailById(id);
            return ResponseEntity.ok(crosswordDetail);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Получить все кроссворды
     * GET /crosswords
     */
    @GetMapping
    public ResponseEntity<List<CrosswordDto>> getAllCrosswords() {
        logger.info("GET /crosswords - Получение всех кроссвордов");
        List<CrosswordDto> crosswords = crosswordService.getAllCrosswords();
        logger.info("Найдено кроссвордов: {}", crosswords.size());
        return ResponseEntity.ok(crosswords);
    }

    /**
     * Получить все кроссворды из словаря
     * GET /crosswords/dictionary/{dictionaryId}
     */
    @GetMapping("/dictionary/{dictionaryId}")
    public ResponseEntity<List<CrosswordDto>> getCrosswordsByDictionary(@PathVariable Long dictionaryId) {
        try {
            List<CrosswordDto> crosswords = crosswordService.getCrosswordsByDictionaryId(dictionaryId);
            return ResponseEntity.ok(crosswords);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Поиск кроссвордов по названию
     * GET /crosswords/search?title=...
     */
    @GetMapping("/search")
    public ResponseEntity<List<CrosswordDto>> searchCrosswords(@RequestParam String title) {
        List<CrosswordDto> crosswords = crosswordService.searchCrosswordsByTitle(title);
        return ResponseEntity.ok(crosswords);
    }

    /**
     * Обновить кроссворд
     * PUT /crosswords/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<CrosswordDto> updateCrossword(@PathVariable Long id,
                                                        @RequestBody CrosswordUpdateDto crosswordUpdateDto) {
        try {
            logger.info("PUT /crosswords/{} - Обновление кроссворда", id);
            CrosswordDto updatedCrossword = crosswordService.updateCrossword(id, crosswordUpdateDto);
            logger.info("Кроссворд с ID {} успешно обновлён", id);
            return ResponseEntity.ok(updatedCrossword);
        } catch (RuntimeException e) {
            logger.error("Ошибка при обновлении кроссворда ID {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Удалить кроссворд
     * DELETE /crosswords/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCrossword(@PathVariable Long id) {
        try {
            logger.info("DELETE /crosswords/{} - Удаление кроссворда", id);
            crosswordService.deleteCrossword(id);
            logger.info("Кроссворд с ID {} успешно удалён", id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            logger.error("Ошибка при удалении кроссворда ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Получить статистику по кроссворду
     * GET /crosswords/{id}/statistics
     */
    @GetMapping("/{id}/statistics")
    public ResponseEntity<CrosswordService.CrosswordStatisticsDto> getCrosswordStatistics(@PathVariable Long id) {
        try {
            CrosswordService.CrosswordStatisticsDto statistics = crosswordService.getCrosswordStatistics(id);
            return ResponseEntity.ok(statistics);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Валидировать кроссворд
     * GET /crosswords/{id}/validate
     */
    @GetMapping("/{id}/validate")
    public ResponseEntity<Boolean> validateCrossword(@PathVariable Long id) {
        try {
            boolean isValid = crosswordService.validateCrossword(id);
            return ResponseEntity.ok(isValid);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Генерировать кроссворд из словаря
     * POST /crosswords/generate
     */
    @PostMapping("/generate")
    public ResponseEntity<CrosswordDetailDto> generateCrossword(
            @RequestParam Long dictionaryId,
            @RequestParam int wordCount,
            @RequestParam String title) {
        try {
            logger.info("POST /crosswords/generate - Генерация кроссворда из словаря {}, слов: {}", dictionaryId, wordCount);
            CrosswordDetailDto crossword = crosswordService.generateCrosswordFromDictionary(dictionaryId, wordCount, title);
            logger.info("Кроссворд успешно сгенерирован с ID: {}", crossword.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(crossword);
        } catch (RuntimeException e) {
            logger.error("Ошибка при генерации кроссворда: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Проверить, какие варианты кроссворда можно создать из словаря
     * GET /crosswords/check-variants
     */
    @GetMapping("/check-variants")
    public ResponseEntity<?> checkVariants(
            @RequestParam Long dictionaryId,
            @RequestParam(defaultValue = "3") int minWords,
            @RequestParam(defaultValue = "10") int maxWords) {
        try {
            logger.info("GET /crosswords/check-variants - Проверка вариантов для словаря {}", dictionaryId);
            Map<Integer, Boolean> availableVariants = crosswordService.checkAvailableVariants(dictionaryId, minWords, maxWords);
            return ResponseEntity.ok(availableVariants);
        } catch (RuntimeException e) {
            logger.error("Ошибка при проверке вариантов: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}

