package com.example.crossword.dto.dtoCrossword;

import com.example.crossword.dto.dtoDictionary.DictionaryDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO для детальной информации о кроссворде (включая данные сетки и слов)
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CrosswordDetailDto extends CrosswordDtoBase{
    private Long id;
    private DictionaryDto dictionary;
    private CrosswordGrid gridData;
    private CrosswordWords wordsData;
}
