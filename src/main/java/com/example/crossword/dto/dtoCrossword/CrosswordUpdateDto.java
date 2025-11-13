package com.example.crossword.dto.dtoCrossword;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO для обновления существующего кроссворда
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CrosswordUpdateDto extends CrosswordDtoBase{
    private CrosswordGrid gridData;
    private CrosswordWords wordsData;
}
