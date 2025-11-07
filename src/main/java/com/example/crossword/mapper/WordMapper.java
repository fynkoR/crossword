package com.example.crossword.mapper;

import com.example.crossword.dtoWord.WordCreateDto;
import com.example.crossword.dtoWord.WordDto;
import com.example.crossword.dtoWord.WordUpdateDto;
import com.example.crossword.enitity.Word;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/**
 * Mapper для преобразования Word entity в DTO и обратно
 */
@Mapper(componentModel = "spring")
public interface WordMapper {
    
    /**
     * Преобразование Word entity в WordDto
     */
    @Mapping(source = "dictionary.id", target = "dictionaryId")
    @Mapping(source = "dictionary.title", target = "dictionaryTitle")
    WordDto toDto(Word word);

    /**
     * Преобразование WordCreateDto в Word entity
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dictionary", ignore = true)
    Word toEntity(WordCreateDto wordCreateDto);

    /**
     * Обновление существующего Word entity из WordUpdateDto
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dictionary", ignore = true)
    void updateEntity(WordUpdateDto wordUpdateDto, @MappingTarget Word word);
}

