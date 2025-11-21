package com.example.crossword.controller;

import com.example.crossword.dto.dtoDictionary.DictionaryDto;
import com.example.crossword.dto.dtoDictionary.DictionaryImportResultDto;
import com.example.crossword.dto.dtoWord.WordDto;
import com.example.crossword.service.DictionaryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * REST контроллер для работы со словарями
 */
@RestController
@RequestMapping("/dictionaries")
public class DictionaryController {

    private static final Logger logger = LoggerFactory.getLogger(DictionaryController.class);
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
            logger.info("POST /dictionaries - Создание словаря: {}", dictionaryDto.getTitle());
            DictionaryDto createdDictionary = dictionaryService.createDictionary(dictionaryDto);
            logger.info("Словарь успешно создан с ID: {}", createdDictionary.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdDictionary);
        } catch (RuntimeException e) {
            logger.error("Ошибка при создании словаря: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Получить словарь по ID
     * GET /dictionaries/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<DictionaryDto> getDictionaryById(@PathVariable Long id) {
        try {
            logger.info("GET /dictionaries/{} - Получение словаря по ID", id);
            DictionaryDto dictionary = dictionaryService.getDictionaryById(id);
            return ResponseEntity.ok(dictionary);
        } catch (RuntimeException e) {
            logger.warn("Словарь с ID {} не найден", id);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Получить все словари
     * GET /dictionaries
     */
    @GetMapping
    public ResponseEntity<List<DictionaryDto>> getAllDictionaries() {
        logger.info("GET /dictionaries - Получение всех словарей");
        List<DictionaryDto> dictionaries = dictionaryService.getAllDictionaries();
        logger.info("Найдено словарей: {}", dictionaries.size());
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
    public ResponseEntity<DictionaryDto> updateDictionary(@PathVariable Long id,
                                                          @RequestBody DictionaryDto dictionaryDto) {
        try {
            logger.info("PUT /dictionaries/{} - Обновление словаря", id);
            DictionaryDto updatedDictionary = dictionaryService.updateDictionary(id, dictionaryDto);
            logger.info("Словарь с ID {} успешно обновлён", id);
            return ResponseEntity.ok(updatedDictionary);
        } catch (RuntimeException e) {
            logger.error("Ошибка при обновлении словаря ID {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Удалить словарь
     * DELETE /dictionaries/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDictionary(@PathVariable Long id) {
        try {
            logger.info("DELETE /dictionaries/{} - Удаление словаря", id);
            dictionaryService.deleteDictionary(id);
            logger.info("Словарь с ID {} успешно удалён", id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            logger.error("Ошибка при удалении словаря ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Получить все слова из словаря
     * GET /dictionaries/{id}/words
     */
    @GetMapping("/{id}/words")
    public ResponseEntity<List<WordDto>> getWordsFromDictionary(@PathVariable Long id) {
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
    public ResponseEntity<DictionaryService.DictionaryStatisticsDto> getDictionaryStatistics(@PathVariable Long id) {
        try {
            DictionaryService.DictionaryStatisticsDto statistics = dictionaryService.getDictionaryStatistics(id);
            return ResponseEntity.ok(statistics);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Импортировать слова в словарь из текстового файла
     * POST /dictionaries/{id}/import
     * 
     * Формат файла: каждая строка содержит слово и определение, разделённые символом '|'
     * Пример содержимого файла:
     * кот|домашнее животное семейства кошачьих
     * собака|домашнее животное, друг человека
     * 
     * @param id ID словаря
     * @param file загружаемый .txt файл
     * @param skipDuplicates если true, дубликаты будут пропущены (по умолчанию true)
     * @return результат импорта со статистикой
     */
    @PostMapping(value = "/{id}/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DictionaryImportResultDto> importDictionary(
            @PathVariable Long id,
            @RequestParam(value = "file", required = true) MultipartFile file,
            @RequestParam(value = "skipDuplicates", defaultValue = "true") boolean skipDuplicates) {
        try {
            logger.info("Начало импорта словаря ID: {}, файл: {}", id, file != null ? file.getOriginalFilename() : "null");
            
            // Проверка файла
            if (file == null || file.isEmpty()) {
                logger.warn("Файл пустой или не предоставлен");
                return ResponseEntity.badRequest().build();
            }

            // Проверка расширения файла
            String filename = file.getOriginalFilename();
            if (filename == null || !filename.toLowerCase().endsWith(".txt")) {
                logger.warn("Неверный формат файла: {}", filename);
                return ResponseEntity.badRequest().build();
            }

            DictionaryImportResultDto result = dictionaryService.importDictionaryFromFile(file, id, skipDuplicates);
            logger.info("Импорт завершён: успешно={}, пропущено={}, ошибок={}", 
                result.getSuccessfullyImported(), result.getSkipped(), result.getFailed());
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            logger.error("Ошибка при импорте словаря ID: " + id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            logger.error("Непредвиденная ошибка при импорте словаря ID: " + id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Экспортировать словарь в текстовый файл
     * GET /dictionaries/{id}/export
     * 
     * Формат файла: каждая строка содержит слово и определение, разделённые символом '|'
     * 
     * @param id ID словаря
     * @return файл .txt для скачивания
     */
    @GetMapping("/{id}/export")
    public ResponseEntity<byte[]> exportDictionary(@PathVariable Long id) {
        try {
            // Получаем данные словаря для имени файла
            DictionaryDto dictionary = dictionaryService.getDictionaryById(id);
            
            // Экспортируем содержимое
            byte[] content = dictionaryService.exportDictionaryToBytes(id);
            
            // Формируем имя файла
            String filename = dictionary.getTitle().replaceAll("[^a-zA-Zа-яА-Я0-9_-]", "_") + ".txt";
            
            // Настраиваем заголовки для скачивания файла
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.TEXT_PLAIN);
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(content.length);
            
            return new ResponseEntity<>(content, headers, HttpStatus.OK);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

