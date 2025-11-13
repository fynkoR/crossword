package com.example.crossword.mapper;

import com.example.crossword.dto.dtoCrossword.CrosswordCreateDto;
import com.example.crossword.dto.dtoCrossword.CrosswordDetailDto;
import com.example.crossword.dto.dtoCrossword.CrosswordDto;
import com.example.crossword.dto.dtoCrossword.CrosswordUpdateDto;
import com.example.crossword.enitity.Crossword;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/**
 * Mapper для преобразования Crossword entity в DTO и обратно
 */
@Mapper(componentModel = "spring", uses = {DictionaryMapper.class})
public interface CrosswordMapper {
    
    /**
     * Преобразование Crossword entity в CrosswordDto (без данных сетки и слов)
     */
    @Mapping(source = "grid_width", target = "gridWidth")
    @Mapping(source = "grid_height", target = "gridHeight")
    @Mapping(source = "dictionary", target = "dictionary")
    CrosswordDto toDto(Crossword crossword);

    /**
     * Преобразование Crossword entity в CrosswordDetailDto (с данными сетки и слов)
     * Примечание: gridData и wordsData должны быть установлены вручную после маппинга,
     * так как они хранятся в JSON формате
     */
    @Mapping(source = "grid_width", target = "gridWidth")
    @Mapping(source = "grid_height", target = "gridHeight")
    @Mapping(source = "dictionary", target = "dictionary")
    @Mapping(target = "gridData", ignore = true)
    @Mapping(target = "wordsData", ignore = true)
    CrosswordDetailDto toDetailDto(Crossword crossword);

    /**
     * Преобразование CrosswordCreateDto в Crossword entity
     * Примечание: dictionary должен быть установлен вручную после маппинга
     * gridData и wordsData должны быть сериализованы в JSON
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "games", ignore = true)
    @Mapping(target = "dictionary", ignore = true)
    @Mapping(source = "gridWidth", target = "grid_width")
    @Mapping(source = "gridHeight", target = "grid_height")
    @Mapping(target = "grid_data", ignore = true)
    @Mapping(target = "words_data", ignore = true)
    Crossword toEntity(CrosswordCreateDto crosswordCreateDto);

    /**
     * Обновление существующего Crossword entity из CrosswordUpdateDto
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "games", ignore = true)
    @Mapping(target = "dictionary", ignore = true)
    @Mapping(source = "gridWidth", target = "grid_width")
    @Mapping(source = "gridHeight", target = "grid_height")
    @Mapping(target = "grid_data", ignore = true)
    @Mapping(target = "words_data", ignore = true)
    void updateEntity(CrosswordUpdateDto crosswordUpdateDto, @MappingTarget Crossword crossword);
}

