package com.example.crossword.dto.dtoCrossword;

import com.example.crossword.dto.dtoDictionary.DictionaryDto;
import lombok.Data;

@Data
public class CrosswordDto extends CrosswordDtoBase{
    private Long id;
    private DictionaryDto dictionary; // только базовая информация о словаре

    // ❌ НЕТ games - чтобы избежать циклических ссылок
    // ❌ НЕТ grid_data - это внутренние данные для генерации
    // ❌ НЕТ words_data - это внутренние данные для генерации
}