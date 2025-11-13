package com.example.crossword.controller;

import com.example.crossword.dto.dtoWord.WordCreateDto;
import com.example.crossword.dto.dtoWord.WordDto;
import com.example.crossword.dto.dtoWord.WordUpdateDto;
import com.example.crossword.service.WordService;
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
            WordDto createdWord = wordService.createWord(wordCreateDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdWord);
        } catch (RuntimeException e) {
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
            WordDto word = wordService.getWordById(id);
            return ResponseEntity.ok(word);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Получить все слова
     * GET /words
     */
    @GetMapping
    public ResponseEntity<List<WordDto>> getAllWords() {
        List<WordDto> words = wordService.getAllWords();
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
            WordDto updatedWord = wordService.updateWord(id, wordUpdateDto);
            return ResponseEntity.ok(updatedWord);
        } catch (RuntimeException e) {
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
            wordService.deleteWord(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
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

