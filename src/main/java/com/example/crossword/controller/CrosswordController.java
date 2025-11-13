package com.example.crossword.controller;

import com.example.crossword.dto.dtoCrossword.CrosswordCreateDto;
import com.example.crossword.dto.dtoCrossword.CrosswordDetailDto;
import com.example.crossword.dto.dtoCrossword.CrosswordDto;
import com.example.crossword.dto.dtoCrossword.CrosswordUpdateDto;
import com.example.crossword.service.CrosswordService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST контроллер для работы с кроссвордами
 */
@RestController
@RequestMapping("/crosswords")
public class CrosswordController {

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
            CrosswordDto createdCrossword = crosswordService.createCrossword(crosswordCreateDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdCrossword);
        } catch (RuntimeException e) {
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
            CrosswordDto crossword = crosswordService.getCrosswordById(id);
            return ResponseEntity.ok(crossword);
        } catch (RuntimeException e) {
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
        List<CrosswordDto> crosswords = crosswordService.getAllCrosswords();
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
            CrosswordDto updatedCrossword = crosswordService.updateCrossword(id, crosswordUpdateDto);
            return ResponseEntity.ok(updatedCrossword);
        } catch (RuntimeException e) {
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
            crosswordService.deleteCrossword(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
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
}

