package com.example.crossword.service;

import com.example.crossword.dto.dtoCrossword.CrosswordGrid;
import com.example.crossword.dto.dtoCrossword.CrosswordWords;
import com.example.crossword.enitity.Word;
import com.example.crossword.repository.WordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Сервис для генерации кроссворда из слов словаря
 */
@Service
public class CrosswordGeneratorService {
    
    private final WordRepository wordRepository;
    
    @Autowired
    public CrosswordGeneratorService(WordRepository wordRepository) {
        this.wordRepository = wordRepository;
    }
    
    /**
     * Генерирует кроссворд из слов словаря
     * Слова размещаются так, что последняя буква первого слова = первая буква второго слова
     */
    public CrosswordGenerationResult generateCrossword(Long dictionaryId, int wordCount) {
        List<Word> allWords = wordRepository.findByDictionaryId(dictionaryId);
        
        if (allWords.isEmpty()) {
            throw new RuntimeException("Словарь пуст");
        }
        
        if (allWords.size() < wordCount) {
            throw new RuntimeException("В словаре недостаточно слов. Нужно минимум " + wordCount);
        }
        
        // Находим цепочку слов, где последняя буква первого = первая буква второго
        List<Word> chainWords = findWordChain(allWords, wordCount);
        
        if (chainWords.size() < wordCount) {
            throw new RuntimeException("Не удалось найти цепочку из " + wordCount + " слов. Найдено только " + chainWords.size());
        }
        
        // Генерируем сетку и размещаем слова
        return placeWordsInGrid(chainWords);
    }
    
    /**
     * Находит цепочку слов, где последняя буква предыдущего = первая буква следующего
     */
    private List<Word> findWordChain(List<Word> allWords, int count) {
        // Преобразуем в список для удобства
        List<Word> words = new ArrayList<>(allWords);
        Collections.shuffle(words); // Перемешиваем для разнообразия
        
        List<Word> chain = new ArrayList<>();
        Set<Long> used = new HashSet<>();
        
        // Начинаем с первого слова
        Word firstWord = words.get(0);
        chain.add(firstWord);
        used.add(firstWord.getId());
        
        String lastLetter = getLastLetter(firstWord.getWord());
        
        // Ищем следующие слова
        while (chain.size() < count && chain.size() < words.size()) {
            boolean found = false;
            
            for (Word word : words) {
                if (used.contains(word.getId())) continue;
                
                String firstLetter = getFirstLetter(word.getWord());
                if (firstLetter.equals(lastLetter)) {
                    chain.add(word);
                    used.add(word.getId());
                    lastLetter = getLastLetter(word.getWord());
                    found = true;
                    break;
                }
            }
            
            // Если не нашли подходящее слово, пробуем начать с другого
            if (!found) {
                for (Word word : words) {
                    if (used.contains(word.getId())) continue;
                    
                    // Проверяем, можно ли добавить это слово к любому слову в цепочке
                    String wordFirst = getFirstLetter(word.getWord());
                    for (Word chainWord : chain) {
                        String chainLast = getLastLetter(chainWord.getWord());
                        if (wordFirst.equals(chainLast)) {
                            chain.add(word);
                            used.add(word.getId());
                            lastLetter = getLastLetter(word.getWord());
                            found = true;
                            break;
                        }
                    }
                    if (found) break;
                }
            }
            
            if (!found) break;
        }
        
        return chain;
    }
    
    /**
     * Размещает слова в сетке кроссворда
     */
    private CrosswordGenerationResult placeWordsInGrid(List<Word> words) {
        if (words.isEmpty()) {
            throw new RuntimeException("Список слов пуст");
        }
        
        // Вычисляем размер сетки
        int maxWordLength = words.stream()
                .mapToInt(w -> w.getWord().length())
                .max()
                .orElse(10);
        
        // Размер сетки: ширина = сумма длин слов + отступы, высота = максимальная длина + отступы
        int gridWidth = Math.max(20, maxWordLength * 2);
        int gridHeight = Math.max(20, maxWordLength * 2);
        
        // Создаем сетку (пока пустую)
        char[][] grid = new char[gridHeight][gridWidth];
        for (int i = 0; i < gridHeight; i++) {
            Arrays.fill(grid[i], ' ');
        }
        
        List<CrosswordWords.CrosswordWord> crosswordWords = new ArrayList<>();
        List<CrosswordGrid.GridCell> cells = new ArrayList<>();
        Map<String, Integer> cellMap = new HashMap<>(); // для быстрого поиска клеток
        
        int startX = 5;
        int startY = gridHeight / 2;
        int wordNumber = 1;
        
        // Размещаем слова горизонтально, одно за другим
        // Слова пересекаются: последняя буква первого слова = первая буква второго слова (в одной клетке)
        int currentX = startX;
        int currentY = startY;
        int prevWordEndX = startX; // Позиция последней буквы предыдущего слова
        
        for (int i = 0; i < words.size(); i++) {
            Word word = words.get(i);
            String wordText = word.getWord().toUpperCase();
            
            // Если это не первое слово, проверяем пересечение
            if (i > 0) {
                Word prevWord = words.get(i - 1);
                String prevWordText = prevWord.getWord().toUpperCase();
                String lastLetter = getLastLetter(prevWordText);
                String firstLetter = getFirstLetter(wordText);
                
                // Должны совпадать
                if (!lastLetter.equals(firstLetter)) {
                    throw new RuntimeException("Ошибка: слова не могут быть соединены");
                }
                
                // Новое слово начинается с позиции последней буквы предыдущего слова
                // Это означает, что первая буква нового слова находится в той же клетке, что и последняя буква предыдущего
                // Поэтому мы начинаем с позиции prevWordEndX, но пропускаем первую букву (она уже есть)
                currentX = prevWordEndX;
                currentY = startY; // Все слова на одной линии
            }
            
            // Создаем объект слова для кроссворда
            CrosswordWords.CrosswordWord crosswordWord = new CrosswordWords.CrosswordWord();
            crosswordWord.setWordId(word.getId());
            crosswordWord.setText(wordText);
            crosswordWord.setDefinition(word.getDefinition());
            crosswordWord.setStartX(currentX);
            crosswordWord.setStartY(currentY);
            crosswordWord.setDirection("horizontal");
            crosswordWord.setLength(wordText.length());
            crosswordWord.setNumber(wordNumber);
            crosswordWord.setIsSolved(false);
            
            // Создаем список позиций для слова
            List<Integer> positions = new ArrayList<>();
            int startPos = 0;
            
            // Если это не первое слово, первая буква уже размещена (пересечение)
            if (i > 0) {
                startPos = 1; // Пропускаем первую букву, она уже в сетке
            }
            
            for (int j = startPos; j < wordText.length(); j++) {
                int x = currentX + j;
                int y = currentY;
                
                // Размещаем букву в сетке
                grid[y][x] = wordText.charAt(j);
                
                // Создаем или обновляем клетку
                String cellKey = x + "," + y;
                CrosswordGrid.GridCell cell;
                
                if (cellMap.containsKey(cellKey)) {
                    cell = cells.get(cellMap.get(cellKey));
                } else {
                    cell = new CrosswordGrid.GridCell();
                    cell.setX(x);
                    cell.setY(y);
                    cell.setIsBlack(false);
                    cell.setIsLocked(false);
                    cell.setLetter(null); // Пока не отгадано
                    cells.add(cell);
                    cellMap.put(cellKey, cells.size() - 1);
                }
                
                // Если это первая буква слова (j == startPos и startPos == 0), устанавливаем номер
                if (j == startPos && startPos == 0) {
                    cell.setNumber(wordNumber);
                }
                
                positions.add(x);
                positions.add(y);
            }
            
            // Если это не первое слово, добавляем позицию первой буквы (пересечение)
            if (i > 0) {
                positions.add(0, currentY);
                positions.add(0, currentX);
            }
            
            crosswordWord.setPositions(positions);
            crosswordWords.add(crosswordWord);
            
            // Сохраняем позицию последней буквы для следующего слова
            prevWordEndX = currentX + wordText.length() - 1;
            
            wordNumber++;
        }
        
        // Создаем объект сетки
        CrosswordGrid gridData = new CrosswordGrid();
        gridData.setCells(cells);
        
        CrosswordGrid.GridSize size = new CrosswordGrid.GridSize();
        size.setWidth(gridWidth);
        size.setHeight(gridHeight);
        gridData.setSize(size);
        
        // Создаем объект слов
        CrosswordWords wordsData = new CrosswordWords();
        wordsData.setWords(crosswordWords);
        wordsData.setIntersections(new ArrayList<>()); // Пока без пересечений
        
        return new CrosswordGenerationResult(gridData, wordsData);
    }
    
    private String getFirstLetter(String word) {
        if (word == null || word.isEmpty()) return "";
        return word.substring(0, 1).toUpperCase();
    }
    
    private String getLastLetter(String word) {
        if (word == null || word.isEmpty()) return "";
        return word.substring(word.length() - 1).toUpperCase();
    }
    
    /**
     * Результат генерации кроссворда
     */
    public static class CrosswordGenerationResult {
        private final CrosswordGrid grid;
        private final CrosswordWords words;
        
        public CrosswordGenerationResult(CrosswordGrid grid, CrosswordWords words) {
            this.grid = grid;
            this.words = words;
        }
        
        public CrosswordGrid getGrid() {
            return grid;
        }
        
        public CrosswordWords getWords() {
            return words;
        }
    }
}

