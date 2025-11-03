package com.example.crossword.dtoCrossword;

import com.example.crossword.dtoDictionary.DictionaryDto;
import lombok.Data;

@Data
public class CrosswordDto {
    private int id;
    private String title;
    private int gridWidth;
    private int gridHeight;
    private DictionaryDto dictionary; // только базовая информация о словаре

    // ❌ НЕТ games - чтобы избежать циклических ссылок
    // ❌ НЕТ grid_data - это внутренние данные для генерации
    // ❌ НЕТ words_data - это внутренние данные для генерации
}