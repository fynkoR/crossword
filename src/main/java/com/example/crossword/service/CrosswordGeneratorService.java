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
        
        // Валидируем цепочку - проверяем, что все слова правильно соединены
        validateWordChain(chainWords);
        
        // Генерируем сетку и размещаем слова
        return placeWordsInGrid(chainWords);
    }
    
    /**
     * Генерирует все возможные варианты кроссворда для словаря
     * Пробует создать кроссворды с разным количеством слов (от minWords до maxWords)
     */
    public Map<Integer, CrosswordGenerationResult> generateAllVariants(Long dictionaryId, int minWords, int maxWords) {
        Map<Integer, CrosswordGenerationResult> variants = new HashMap<>();
        
        List<Word> allWords = wordRepository.findByDictionaryId(dictionaryId);
        
        if (allWords.isEmpty()) {
            throw new RuntimeException("Словарь пуст");
        }
        
        for (int wordCount = minWords; wordCount <= maxWords; wordCount++) {
            if (wordCount > allWords.size()) {
                break; // Не хватает слов
            }
            
            try {
                CrosswordGenerationResult result = generateCrossword(dictionaryId, wordCount);
                variants.put(wordCount, result);
            } catch (RuntimeException e) {
                // Не удалось создать кроссворд с таким количеством слов, пропускаем
                System.out.println("Не удалось создать кроссворд с " + wordCount + " словами: " + e.getMessage());
            }
        }
        
        if (variants.isEmpty()) {
            throw new RuntimeException("Не удалось создать ни одного варианта кроссворда для данного словаря");
        }
        
        return variants;
    }
    
    /**
     * Валидирует цепочку слов - проверяет, что каждое следующее слово начинается с последней буквы предыдущего
     */
    private void validateWordChain(List<Word> chain) {
        for (int i = 1; i < chain.size(); i++) {
            Word prevWord = chain.get(i - 1);
            Word currWord = chain.get(i);
            
            String lastLetter = getLastLetter(prevWord.getWord());
            String firstLetter = getFirstLetter(currWord.getWord());
            
            if (!lastLetter.equals(firstLetter)) {
                throw new RuntimeException(
                    String.format("Ошибка валидации: слово '%s' не может следовать за словом '%s' (последняя буква '%s' != первая буква '%s')",
                        currWord.getWord(), prevWord.getWord(), lastLetter, firstLetter)
                );
            }
        }
    }
    
    /**
     * Находит цепочку слов, где последняя буква предыдущего = первая буква следующего
     * Находит ВСЕ возможные цепочки без ограничений
     */
    private List<Word> findWordChain(List<Word> allWords, int count) {
        // Сортируем слова по ID для детерминированности
        List<Word> words = new ArrayList<>(allWords);
        words.sort(Comparator.comparing(Word::getId));
        
        // Строим граф связей между словами
        Map<Long, List<Word>> graph = buildWordGraph(words);
        
        // Ищем ВСЕ возможные цепочки нужной длины
        List<List<Word>> allChains = new ArrayList<>();
        
        // Пробуем начать с КАЖДОГО слова
        for (Word startWord : words) {
            List<Word> currentChain = new ArrayList<>();
            Set<Long> used = new HashSet<>();
            
            // Рекурсивно ищем все цепочки, начинающиеся с этого слова
            findAllChainsRecursive(startWord, currentChain, used, count, graph, allChains);
        }
        
        System.out.println("Найдено цепочек нужной длины (" + count + " слов): " + allChains.size());
        
        // Если нашли хотя бы одну цепочку нужной длины, возвращаем первую
        if (!allChains.isEmpty()) {
            // Выводим первые 5 вариантов для отладки
            int limit = Math.min(5, allChains.size());
            System.out.println("Примеры найденных цепочек:");
            for (int i = 0; i < limit; i++) {
                List<Word> chain = allChains.get(i);
                System.out.print("  " + (i+1) + ". ");
                for (int j = 0; j < chain.size(); j++) {
                    System.out.print(chain.get(j).getWord());
                    if (j < chain.size() - 1) System.out.print(" → ");
                }
                System.out.println();
            }
            return allChains.get(0);
        }
        
        // Если не нашли цепочку нужной длины, возвращаем пустой список
        return new ArrayList<>();
    }
    
    /**
     * Строит граф связей между словами
     * Ключ - ID слова, значение - список слов, которые могут следовать за ним
     */
    private Map<Long, List<Word>> buildWordGraph(List<Word> words) {
        Map<Long, List<Word>> graph = new HashMap<>();
        
        for (Word word : words) {
            List<Word> nextWords = new ArrayList<>();
            String lastLetter = getLastLetter(word.getWord());
            
            for (Word nextWord : words) {
                if (word.getId().equals(nextWord.getId())) continue;
                
                String firstLetter = getFirstLetter(nextWord.getWord());
                if (lastLetter.equals(firstLetter)) {
                    nextWords.add(nextWord);
                }
            }
            
            graph.put(word.getId(), nextWords);
        }
        
        return graph;
    }
    
    /**
     * Рекурсивно находит ВСЕ цепочки слов БЕЗ ОГРАНИЧЕНИЙ
     */
    private void findAllChainsRecursive(Word currentWord, List<Word> currentChain, Set<Long> used, 
                                       int targetLength, Map<Long, List<Word>> graph, 
                                       List<List<Word>> allChains) {
        // Добавляем текущее слово в цепочку
        currentChain.add(currentWord);
        used.add(currentWord.getId());
        
        // Если достигли нужной длины, сохраняем цепочку
        if (currentChain.size() == targetLength) {
            allChains.add(new ArrayList<>(currentChain));
        } 
        // Если цепочка короче, продолжаем поиск со ВСЕМИ возможными следующими словами
        else if (currentChain.size() < targetLength) {
            List<Word> possibleNextWords = graph.get(currentWord.getId());
            
            if (possibleNextWords != null) {
                // Пробуем КАЖДОЕ возможное следующее слово
                for (Word nextWord : possibleNextWords) {
                    if (!used.contains(nextWord.getId())) {
                        findAllChainsRecursive(nextWord, currentChain, used, targetLength, graph, allChains);
                    }
                }
            }
        }
        
        // Откатываем изменения (backtracking) для проверки других веток
        currentChain.remove(currentChain.size() - 1);
        used.remove(currentWord.getId());
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

