package com.example.crossword.dto.dtoDictionary;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO для результата импорта словаря из файла
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class DictionaryImportResultDto {
    private Long dictionaryId;
    private String dictionaryTitle;
    private int totalLines;
    private int successfullyImported;
    private int skipped;
    private int failed;
    private String message;
}

