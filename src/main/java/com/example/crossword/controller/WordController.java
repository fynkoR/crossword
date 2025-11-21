package com.example.crossword.controller;

import com.example.crossword.dto.dtoWord.WordCreateDto;
import com.example.crossword.dto.dtoWord.WordDto;
import com.example.crossword.dto.dtoWord.WordUpdateDto;
import com.example.crossword.service.WordService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST контроллер для работы со словами
 */
@RestController
@RequestMapping("/words")
public class WordController {

    private static final Logger logger = LoggerFactory.getLogger(WordController.class);
    private final WordService wordService;

    public WordController(WordService wordService) {
        this.wordService = wordService;
    }

    /**
     * Создать новое слово
     * POST /words
     */
    @PostMapping
    public ResponseEntity<WordDto> createWord(@RequestBody WordCreateDto wordCreateDto) {
        try {
            logger.info("POST /words - Создание слова: {}", wordCreateDto.getWord());
            WordDto createdWord = wordService.createWord(wordCreateDto);
            logger.info("Слово успешно создано с ID: {}", createdWord.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdWord);
        } catch (RuntimeException e) {
            logger.error("Ошибка при создании слова: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Получить слово по ID
     * GET /words/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<WordDto> getWordById(@PathVariable Long id) {
        try {
            logger.info("GET /words/{} - Получение слова по ID", id);
            WordDto word = wordService.getWordById(id);
            return ResponseEntity.ok(word);
        } catch (RuntimeException e) {
            logger.warn("Слово с ID {} не найдено", id);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Получить все слова
     * GET /words
     */
    @GetMapping
    public ResponseEntity<List<WordDto>> getAllWords() {
        logger.info("GET /words - Получение всех слов");
        List<WordDto> words = wordService.getAllWords();
        logger.info("Найдено слов: {}", words.size());
        return ResponseEntity.ok(words);
    }

    /**
     * Получить все слова из словаря
     * GET /words/dictionary/{dictionaryId}
     */
    @GetMapping("/dictionary/{dictionaryId}")
    public ResponseEntity<List<WordDto>> getWordsByDictionary(@PathVariable Long dictionaryId) {
        try {
            List<WordDto> words = wordService.getWordsByDictionaryId(dictionaryId);
            return ResponseEntity.ok(words);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Поиск слов по подстроке
     * GET /words/search?term=...
     */
    @GetMapping("/search")
    public ResponseEntity<List<WordDto>> searchWords(@RequestParam String term) {
        List<WordDto> words = wordService.searchWords(term);
        return ResponseEntity.ok(words);
    }

    /**
     * Обновить слово
     * PUT /words/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<WordDto> updateWord(@PathVariable Long id,
                                             @RequestBody WordUpdateDto wordUpdateDto) {
        try {
            logger.info("PUT /words/{} - Обновление слова", id);
            WordDto updatedWord = wordService.updateWord(id, wordUpdateDto);
            logger.info("Слово с ID {} успешно обновлено", id);
            return ResponseEntity.ok(updatedWord);
        } catch (RuntimeException e) {
            logger.error("Ошибка при обновлении слова ID {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Удалить слово
     * DELETE /words/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWord(@PathVariable Long id) {
        try {
            logger.info("DELETE /words/{} - Удаление слова", id);
            wordService.deleteWord(id);
            logger.info("Слово с ID {} успешно удалено", id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            logger.error("Ошибка при удалении слова ID {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Получить количество слов в словаре
     * GET /words/dictionary/{dictionaryId}/count
     */
    @GetMapping("/dictionary/{dictionaryId}/count")
    public ResponseEntity<Long> getWordCount(@PathVariable Long dictionaryId) {
        try {
            Long count = wordService.getWordCountByDictionary(dictionaryId);
            return ResponseEntity.ok(count);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

