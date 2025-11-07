package com.example.crossword.controller;

import com.example.crossword.dtoDictionary.DictionaryDto;
import com.example.crossword.dtoWord.WordDto;
import com.example.crossword.service.DictionaryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST контроллер для работы со словарями
 */
@RestController
@RequestMapping("/dictionaries")
public class DictionaryController {

    private final DictionaryService dictionaryService;

    public DictionaryController(DictionaryService dictionaryService) {
        this.dictionaryService = dictionaryService;
    }

    /**
     * Создать новый словарь
     * POST /dictionaries
     */
    @PostMapping
    public ResponseEntity<DictionaryDto> createDictionary(@RequestBody DictionaryDto dictionaryDto) {
        try {
            DictionaryDto createdDictionary = dictionaryService.createDictionary(dictionaryDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdDictionary);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Получить словарь по ID
     * GET /dictionaries/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<DictionaryDto> getDictionaryById(@PathVariable Integer id) {
        try {
            DictionaryDto dictionary = dictionaryService.getDictionaryById(id);
            return ResponseEntity.ok(dictionary);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Получить все словари
     * GET /dictionaries
     */
    @GetMapping
    public ResponseEntity<List<DictionaryDto>> getAllDictionaries() {
        List<DictionaryDto> dictionaries = dictionaryService.getAllDictionaries();
        return ResponseEntity.ok(dictionaries);
    }

    /**
     * Поиск словарей по названию
     * GET /dictionaries/search?title=...
     */
    @GetMapping("/search")
    public ResponseEntity<List<DictionaryDto>> searchDictionaries(@RequestParam String title) {
        List<DictionaryDto> dictionaries = dictionaryService.searchDictionariesByTitle(title);
        return ResponseEntity.ok(dictionaries);
    }

    /**
     * Обновить словарь
     * PUT /dictionaries/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<DictionaryDto> updateDictionary(@PathVariable Integer id,
                                                          @RequestBody DictionaryDto dictionaryDto) {
        try {
            DictionaryDto updatedDictionary = dictionaryService.updateDictionary(id, dictionaryDto);
            return ResponseEntity.ok(updatedDictionary);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Удалить словарь
     * DELETE /dictionaries/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDictionary(@PathVariable Integer id) {
        try {
            dictionaryService.deleteDictionary(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Получить все слова из словаря
     * GET /dictionaries/{id}/words
     */
    @GetMapping("/{id}/words")
    public ResponseEntity<List<WordDto>> getWordsFromDictionary(@PathVariable Integer id) {
        try {
            List<WordDto> words = dictionaryService.getWordsFromDictionary(id);
            return ResponseEntity.ok(words);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Получить статистику по словарю
     * GET /dictionaries/{id}/statistics
     */
    @GetMapping("/{id}/statistics")
    public ResponseEntity<DictionaryService.DictionaryStatisticsDto> getDictionaryStatistics(@PathVariable Integer id) {
        try {
            DictionaryService.DictionaryStatisticsDto statistics = dictionaryService.getDictionaryStatistics(id);
            return ResponseEntity.ok(statistics);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

