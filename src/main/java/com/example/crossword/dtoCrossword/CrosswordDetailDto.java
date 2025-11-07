package com.example.crossword.dtoCrossword;

import com.example.crossword.dtoDictionary.DictionaryDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO для детальной информации о кроссворде (включая данные сетки и слов)
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CrosswordDetailDto {
    private Integer id;
    private String title;
    private Integer gridWidth;
    private Integer gridHeight;
    private DictionaryDto dictionary;
    private CrosswordGrid gridData;
    private CrosswordWords wordsData;
}
