package com.example.crossword.mapper;

import com.example.crossword.dtoDictionary.DictionaryDto;
import com.example.crossword.enitity.Dictionary;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/**
 * Mapper для преобразования Dictionary entity в DTO и обратно
 */
@Mapper(componentModel = "spring")
public interface DictionaryMapper {
    
    /**
     * Преобразование Dictionary entity в DictionaryDto
     */
    @Mapping(target = "title", source = "title")
    @Mapping(target = "description", source = "description")
    DictionaryDto toDto(Dictionary dictionary);

    /**
     * Преобразование DictionaryDto в Dictionary entity
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "crosswords", ignore = true)
    @Mapping(target = "words", ignore = true)
    Dictionary toEntity(DictionaryDto dictionaryDto);

    /**
     * Обновление существующего Dictionary entity из DictionaryDto
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "crosswords", ignore = true)
    @Mapping(target = "words", ignore = true)
    void updateEntity(DictionaryDto dictionaryDto, @MappingTarget Dictionary dictionary);
}

