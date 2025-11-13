package com.example.crossword.dto.dtoCrossword;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO для создания нового кроссворда
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CrosswordCreateDto extends CrosswordDtoBase {
    private Long dictionaryId;
    private CrosswordGrid gridData;
    private CrosswordWords wordsData;
}
