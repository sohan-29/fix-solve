const mongoose = require('mongoose');
require('dotenv').config();

const Problem = require('./models/problem');

const problems = [
  // ===== ALL ROUND 1 — DEBUGGING PROBLEMS =====

  // Q1: Fix the String Array Size
  {
    title: 'Fix the String Array Size',
    description: 'The following program should print "Hello" but it has a bug related to the character array size. In C, strings require an extra character for the null terminator (\'\\0\'). Find and fix the bug!\n\nDO NOT MODIFY THE MAIN FUNCTION - Only fix the array declaration.',
    roundType: 1,
    inputFormat: 'No input required',
    outputFormat: 'Hello',
    constraints: 'None',
    sampleInput: '',
    sampleOutput: 'Hello',
    starterCodeByLanguage: {
      c: `#include <stdio.h>

int main() {
    char arr[5] = "Hello";
    printf("%s\\n", arr);
    return 0;
}`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    char arr[5] = "Hello";
    cout << arr << endl;
    return 0;
}`,
      java: `public class Main {
    public static void main(String[] args) {
        char[] arr = new char[5];
        String hello = "Hello";
        for (int i = 0; i < hello.length(); i++) {
            arr[i] = hello.charAt(i);
        }
        System.out.println(new String(arr, 0, arr.length - 1));
    }
}`,
      python: `def main():
    arr = list("Hello")
    print("".join(arr[:4]))

if __name__ == "__main__":
    main()`
    },
    supportedLanguages: ['c', 'cpp', 'java', 'python'],
    testCases: [
      { input: '', output: 'Hello' },
      { input: '', output: 'Hello' }
    ],
    hiddenTestCases: [
      { input: '', output: 'Hello' },
      { input: '', output: 'Hello' },
      { input: '', output: 'Hello' }
    ],
    timeLimit: 60,
    difficulty: 'Easy',
    complexity: 'O(1)'
  },

  // Q2: Fix the Integer Overflow
  {
    title: 'Fix the Integer Overflow',
    description: 'The following program tries to add 1 to the maximum integer value, causing an integer overflow. Fix the code so it correctly handles large numbers without overflow.\n\nDO NOT MODIFY THE LOGIC - Only fix the data type and format specifier.',
    roundType: 1,
    inputFormat: 'No input required',
    outputFormat: '2147483648',
    constraints: 'Must handle values larger than INT_MAX',
    sampleInput: '',
    sampleOutput: '2147483648',
    starterCodeByLanguage: {
      c: `#include <stdio.h>

int main() {
    int x = 2147483647;
    printf("%d\\n", x + 1);
    return 0;
}`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int x = 2147483647;
    cout << x + 1 << endl;
    return 0;
}`,
      java: `public class Main {
    public static void main(String[] args) {
        int x = 2147483647;
        System.out.println(x + 1);
    }
}`,
      python: `def main():
    import ctypes
    x = ctypes.c_int(2147483647).value
    result = (x + 1) & 0xFFFFFFFF
    if result >= 0x80000000:
        result -= 0x100000000
    print(result)

if __name__ == "__main__":
    main()`
    },
    supportedLanguages: ['c', 'cpp', 'java', 'python'],
    testCases: [
      { input: '', output: '2147483648' },
      { input: '', output: '2147483648' }
    ],
    hiddenTestCases: [
      { input: '', output: '2147483648' },
      { input: '', output: '2147483648' },
      { input: '', output: '2147483648' }
    ],
    timeLimit: 60,
    difficulty: 'Easy',
    complexity: 'O(1)'
  },

  // Q3: Fix the Deadlock (C only)
  {
    title: 'Fix the Deadlock',
    description: 'The following program uses two threads that each lock two mutexes but in opposite order, causing a potential deadlock. Fix the code so both threads acquire locks in the same order to prevent deadlock.\n\nFix the lock ordering in task2 so it matches task1.',
    roundType: 1,
    inputFormat: 'No input required',
    outputFormat: 'Task1 locked lock1\\nTask1 locked lock2\\nTask2 locked lock1\\nTask2 locked lock2',
    constraints: 'Must use pthreads. Lock ordering must be consistent.',
    sampleInput: '',
    sampleOutput: 'Task1 locked lock1\nTask1 locked lock2\nTask2 locked lock1\nTask2 locked lock2',
    starterCodeByLanguage: {
      c: `#include <stdio.h>
#include <pthread.h>

pthread_mutex_t lock1 = PTHREAD_MUTEX_INITIALIZER;
pthread_mutex_t lock2 = PTHREAD_MUTEX_INITIALIZER;

void* task1(void* arg) {
    pthread_mutex_lock(&lock1);
    printf("Task1 locked lock1\\n");
    pthread_mutex_lock(&lock2);
    printf("Task1 locked lock2\\n");
    pthread_mutex_unlock(&lock2);
    pthread_mutex_unlock(&lock1);
    return NULL;
}

void* task2(void* arg) {
    pthread_mutex_lock(&lock2);
    printf("Task2 locked lock2\\n");
    pthread_mutex_lock(&lock1);
    printf("Task2 locked lock1\\n");
    pthread_mutex_unlock(&lock1);
    pthread_mutex_unlock(&lock2);
    return NULL;
}

int main() {
    pthread_t t1, t2;
    pthread_create(&t1, NULL, task1, NULL);
    pthread_create(&t2, NULL, task2, NULL);
    pthread_join(t1, NULL);
    pthread_join(t2, NULL);
    return 0;
}`
    },
    supportedLanguages: ['c'],
    testCases: [
      { input: '', output: 'Task1 locked lock1\nTask1 locked lock2\nTask2 locked lock1\nTask2 locked lock2' },
      { input: '', output: 'Task1 locked lock1\nTask1 locked lock2\nTask2 locked lock1\nTask2 locked lock2' }
    ],
    hiddenTestCases: [
      { input: '', output: 'Task1 locked lock1\nTask1 locked lock2\nTask2 locked lock1\nTask2 locked lock2' },
      { input: '', output: 'Task1 locked lock1\nTask1 locked lock2\nTask2 locked lock1\nTask2 locked lock2' },
      { input: '', output: 'Task1 locked lock1\nTask1 locked lock2\nTask2 locked lock1\nTask2 locked lock2' }
    ],
    timeLimit: 120,
    difficulty: 'Hard',
    complexity: 'O(1)'
  },

  // Q4: Fix the Palindrome Check (bugs injected: missing boundary check + missing case-insensitive comparison)
  {
    title: 'Fix the Palindrome Check',
    description: 'The following function checks if a string is a palindrome considering only alphanumeric characters and ignoring cases, but it has bugs. The while loops skip non-alphanumeric characters without checking boundaries, and the comparison may not handle case properly. Find and fix all bugs!\n\nDO NOT MODIFY THE MAIN FUNCTION - Only fix the isPalindrome() function.',
    roundType: 1,
    inputFormat: 'A single string s',
    outputFormat: 'true or false',
    constraints: 'String length <= 10000. Consider only alphanumeric characters.',
    sampleInput: 'A man, a plan, a canal: Panama',
    sampleOutput: 'true',
    starterCodeByLanguage: {
      c: `#include <stdio.h>
#include <string.h>
#include <ctype.h>
#include <stdbool.h>

bool isPalindrome(char *s) {
    int left = 0;
    int right = strlen(s) - 1;
    while (left < right) {
        while (!isalnum(s[left])) left++;
        while (!isalnum(s[right])) right--;

        if (s[left] != s[right])
            return false;

        left++;
        right--;
    }
    return true;
}

int main() {
    char s[10001];
    fgets(s, sizeof(s), stdin);
    s[strcspn(s, "\\n")] = 0;
    if (isPalindrome(s))
        printf("true");
    else
        printf("false");
    return 0;
}`,
      cpp: `#include <iostream>
#include <string>
#include <cctype>
using namespace std;

bool isPalindrome(string s) {
    int left = 0;
    int right = s.length() - 1;
    while (left < right) {
        while (!isalnum(s[left])) left++;
        while (!isalnum(s[right])) right--;

        if (s[left] != s[right])
            return false;

        left++;
        right--;
    }
    return true;
}

int main() {
    string s;
    getline(cin, s);
    cout << (isPalindrome(s) ? "true" : "false");
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    public static boolean isPalindrome(String s) {
        int left = 0;
        int right = s.length() - 1;
        while (left < right) {
            while (!Character.isLetterOrDigit(s.charAt(left))) left++;
            while (!Character.isLetterOrDigit(s.charAt(right))) right--;

            if (s.charAt(left) != s.charAt(right))
                return false;

            left++;
            right--;
        }
        return true;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        System.out.println(isPalindrome(s) ? "true" : "false");
    }
}`,
      python: `def isPalindrome(s):
    left = 0
    right = len(s) - 1
    while left < right:
        while not s[left].isalnum():
            left += 1
        while not s[right].isalnum():
            right -= 1

        if s[left] != s[right]:
            return False

        left += 1
        right -= 1
    return True

if __name__ == "__main__":
    s = input().strip()
    print("true" if isPalindrome(s) else "false")`
    },
    supportedLanguages: ['c', 'cpp', 'java', 'python'],
    testCases: [
      { input: 'A man, a plan, a canal: Panama', output: 'true' },
      { input: 'race a car', output: 'false' }
    ],
    hiddenTestCases: [
      { input: ' ', output: 'true' },
      { input: 'Was it a car or a cat I saw?', output: 'true' },
      { input: 'hello', output: 'false' }
    ],
    timeLimit: 60,
    difficulty: 'Medium',
    complexity: 'O(n)'
  },

  // Q5: Fix the Insertion Sort
  {
    title: 'Fix the Insertion Sort',
    description: 'The following insertion sort function should sort an array in ascending order, but it has a bug. The while loop is missing a boundary check which can cause out-of-bounds access. Find and fix it!\n\nDO NOT MODIFY THE MAIN FUNCTION - Only fix the insertionSort() function.',
    roundType: 1,
    inputFormat: 'First line: integer n (size of array)\nSecond line: n space-separated integers',
    outputFormat: 'Space-separated sorted integers',
    constraints: '1 <= n <= 1000, -10000 <= arr[i] <= 10000',
    sampleInput: '6\n5 2 4 6 1 3',
    sampleOutput: '1 2 3 4 5 6',
    starterCodeByLanguage: {
      c: `#include <stdio.h>

void insertionSort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;

        while (arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }

        arr[j + 1] = key;
    }
}

int main() {
    int n;
    scanf("%d", &n);
    int arr[n];
    for (int i = 0; i < n; i++)
        scanf("%d", &arr[i]);
    insertionSort(arr, n);
    for (int i = 0; i < n; i++)
        printf("%d ", arr[i]);
    return 0;
}`,
      cpp: `#include <iostream>
using namespace std;

void insertionSort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;

        while (arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }

        arr[j + 1] = key;
    }
}

int main() {
    int n;
    cin >> n;
    int arr[n];
    for (int i = 0; i < n; i++)
        cin >> arr[i];
    insertionSort(arr, n);
    for (int i = 0; i < n; i++)
        cout << arr[i] << " ";
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    public static void insertionSort(int[] arr, int n) {
        for (int i = 1; i < n; i++) {
            int key = arr[i];
            int j = i - 1;

            while (arr[j] > key) {
                arr[j + 1] = arr[j];
                j--;
            }

            arr[j + 1] = key;
        }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++)
            arr[i] = sc.nextInt();
        insertionSort(arr, n);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            sb.append(arr[i]);
            if (i < n - 1) sb.append(" ");
        }
        System.out.println(sb.toString());
    }
}`,
      python: `def insertionSort(arr, n):
    for i in range(1, n):
        key = arr[i]
        j = i - 1

        while arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1

        arr[j + 1] = key

if __name__ == "__main__":
    n = int(input().strip())
    arr = list(map(int, input().strip().split()))
    insertionSort(arr, n)
    print(" ".join(map(str, arr)))`
    },
    supportedLanguages: ['c', 'cpp', 'java', 'python'],
    testCases: [
      { input: '6\n5 2 4 6 1 3', output: '1 2 3 4 5 6' },
      { input: '5\n1 2 3 4 5', output: '1 2 3 4 5' }
    ],
    hiddenTestCases: [
      { input: '3\n3 1 2', output: '1 2 3' },
      { input: '4\n-5 3 -1 7', output: '-5 -1 3 7' },
      { input: '1\n42', output: '42' }
    ],
    timeLimit: 60,
    difficulty: 'Medium',
    complexity: 'O(n^2)'
  },

  // Q6: Fix the Valid Anagram (bugs injected: incrementing instead of decrementing for second string)
  {
    title: 'Fix the Valid Anagram',
    description: 'The following function checks if two strings are anagrams of each other. Two strings are anagrams if they contain the same characters with the same frequencies. However, the code has a bug in how it processes the second string. Find and fix it!\n\nDO NOT MODIFY THE MAIN FUNCTION - Only fix the isAnagram() function.',
    roundType: 1,
    inputFormat: 'Two strings s and t on separate lines',
    outputFormat: 'true or false',
    constraints: 'Strings contain only lowercase English letters. Length <= 10000.',
    sampleInput: 'anagram\nnagaram',
    sampleOutput: 'true',
    starterCodeByLanguage: {
      c: `#include <stdio.h>
#include <string.h>
#include <stdbool.h>

bool isAnagram(char *s, char *t) {
    if (strlen(s) != strlen(t)) return false;

    int count[26] = {0};

    for (int i = 0; i < strlen(s); i++) {
        count[s[i] - 'a']++;
    }

    for (int i = 0; i < strlen(t); i++) {
        count[t[i] - 'a']++;
    }

    for (int i = 0; i < 26; i++) {
        if (count[i] != 0) return false;
    }

    return true;
}

int main() {
    char s[10001], t[10001];
    scanf("%s", s);
    scanf("%s", t);
    printf(isAnagram(s, t) ? "true" : "false");
    return 0;
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;

bool isAnagram(string s, string t) {
    if (s.length() != t.length()) return false;

    int count[26] = {0};

    for (int i = 0; i < s.length(); i++) {
        count[s[i] - 'a']++;
    }

    for (int i = 0; i < t.length(); i++) {
        count[t[i] - 'a']++;
    }

    for (int i = 0; i < 26; i++) {
        if (count[i] != 0) return false;
    }

    return true;
}

int main() {
    string s, t;
    cin >> s >> t;
    cout << (isAnagram(s, t) ? "true" : "false");
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    public static boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;

        int[] count = new int[26];

        for (int i = 0; i < s.length(); i++) {
            count[s.charAt(i) - 'a']++;
        }

        for (int i = 0; i < t.length(); i++) {
            count[t.charAt(i) - 'a']++;
        }

        for (int i = 0; i < 26; i++) {
            if (count[i] != 0) return false;
        }

        return true;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        String t = sc.next();
        System.out.println(isAnagram(s, t) ? "true" : "false");
    }
}`,
      python: `def isAnagram(s, t):
    if len(s) != len(t):
        return False

    count = [0] * 26

    for c in s:
        count[ord(c) - ord('a')] += 1

    for c in t:
        count[ord(c) - ord('a')] += 1

    for i in range(26):
        if count[i] != 0:
            return False

    return True

if __name__ == "__main__":
    s = input().strip()
    t = input().strip()
    print("true" if isAnagram(s, t) else "false")`
    },
    supportedLanguages: ['c', 'cpp', 'java', 'python'],
    testCases: [
      { input: 'anagram\nnagaram', output: 'true' },
      { input: 'rat\ncar', output: 'false' }
    ],
    hiddenTestCases: [
      { input: 'listen\nsilent', output: 'true' },
      { input: 'hello\nworld', output: 'false' },
      { input: 'abc\ncba', output: 'true' }
    ],
    timeLimit: 60,
    difficulty: 'Medium',
    complexity: 'O(n)'
  },

  // Q7: Count Increasing Segments (4 bugs)
  {
    title: 'Count Increasing Segments',
    description: 'Given an array, count the number of segments of strictly increasing numbers. The code has multiple bugs related to loop bounds, comparison operators, and logical errors. Find and fix all bugs!\n\nDO NOT MODIFY THE MAIN FUNCTION - Only fix the countSegments() function.',
    roundType: 1,
    inputFormat: 'First line: integer n (size of array)\nSecond line: n space-separated integers',
    outputFormat: 'Number of strictly increasing segments',
    constraints: '1 <= n <= 1000',
    sampleInput: '6\n1 2 3 1 2 5',
    sampleOutput: '2',
    starterCodeByLanguage: {
      c: `#include <stdio.h>
#include <stdbool.h>

int countSegments(int arr[], int n) {
    int count = 0;
    bool increasing = false;

    for (int i = 1; i <= n; i++) {
        if (arr[i] >= arr[i - 1]) {
            increasing = true;
        } else {
            if (increasing = true)
                count++;
            increasing = false;
        }
    }
    if (increasing)
        count++;

    printf("%d", count);
    return count;
}

int main() {
    int n;
    scanf("%d", &n);
    int arr[n];
    for (int i = 0; i < n; i++)
        scanf("%d", &arr[i]);
    countSegments(arr, n);
    return 0;
}`,
      cpp: `#include <iostream>
using namespace std;

int countSegments(int arr[], int n) {
    int count = 0;
    bool increasing = false;

    for (int i = 1; i <= n; i++) {
        if (arr[i] >= arr[i - 1]) {
            increasing = true;
        } else {
            if (increasing = true)
                count++;
            increasing = false;
        }
    }
    if (increasing)
        count++;

    cout << count;
    return count;
}

int main() {
    int n;
    cin >> n;
    int arr[n];
    for (int i = 0; i < n; i++)
        cin >> arr[i];
    countSegments(arr, n);
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    public static int countSegments(int[] arr, int n) {
        int count = 0;
        boolean increasing = false;

        for (int i = 1; i <= n; i++) {
            if (arr[i] >= arr[i - 1]) {
                increasing = true;
            } else {
                if (increasing == true)
                    count++;
                increasing = false;
            }
        }
        if (increasing)
            count--;

        System.out.print(count);
        return count;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++)
            arr[i] = sc.nextInt();
        countSegments(arr, n);
    }
}`,
      python: `def countSegments(arr, n):
    count = 0
    increasing = False

    for i in range(1, n + 1):
        if arr[i] >= arr[i - 1]:
            increasing = True
        else:
            if increasing:
                count += 1
            increasing = False

    if increasing:
        count -= 1

    print(count)

if __name__ == "__main__":
    n = int(input().strip())
    arr = list(map(int, input().strip().split()))
    countSegments(arr, n)`
    },
    supportedLanguages: ['c', 'cpp', 'java', 'python'],
    testCases: [
      { input: '6\n1 2 3 1 2 5', output: '2' },
      { input: '5\n5 4 3 2 1', output: '0' }
    ],
    hiddenTestCases: [
      { input: '4\n1 2 3 4', output: '1' },
      { input: '7\n1 3 2 4 5 1 2', output: '3' },
      { input: '1\n5', output: '0' }
    ],
    timeLimit: 60,
    difficulty: 'Medium',
    complexity: 'O(n)'
  },

  // Q8: Longest Repeating Prefix Pattern (4 bugs)
  {
    title: 'Longest Repeating Prefix Pattern',
    description: 'Given a string S, determine the longest prefix pattern that repeats consecutively at least twice at the start of the string. If no repeating pattern exists, print "No Pattern". The code has multiple bugs related to loop bounds and string copy length. Find and fix all bugs!\n\nDO NOT MODIFY THE MAIN FUNCTION - Only fix the findPattern() function.',
    roundType: 1,
    inputFormat: 'A single string S',
    outputFormat: 'Pattern Length and Pattern on separate lines, or "No Pattern"',
    constraints: 'String length <= 100',
    sampleInput: 'abcabcabcx',
    sampleOutput: 'Pattern Length: 3\nPattern: abc',
    starterCodeByLanguage: {
      c: `#include <stdio.h>
#include <string.h>
#include <stdbool.h>

void findPattern(char s[]) {
    int n = strlen(s);
    int maxLen = 0;

    for (int len = 1; len <= n / 2; len++) {
        bool match = true;
        for (int i = 0; i <= len; i++) {
            if (s[i] != s[i + len]) {
                match = false;
                break;
            }
        }
        if (match)
            maxLen = len;
    }

    if (maxLen) {
        char pattern[100];
        strncpy(pattern, s, maxLen + 1);
        pattern[maxLen + 1] = '\\0';
        printf("Pattern Length: %d\\n", maxLen);
        printf("Pattern: %s\\n", pattern);
    } else {
        printf("No Pattern\\n");
    }
}

int main() {
    char s[100];
    scanf("%s", s);
    findPattern(s);
    return 0;
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;

void findPattern(string s) {
    int n = s.length();
    int maxLen = 0;

    for (int len = 1; len <= n / 2; len++) {
        bool match = true;
        for (int i = 0; i <= len; i++) {
            if (s[i] != s[i + len]) {
                match = false;
                break;
            }
        }
        if (match)
            maxLen = len;
    }

    if (maxLen) {
        string pattern = s.substr(0, maxLen + 1);
        cout << "Pattern Length: " << maxLen + 1 << endl;
        cout << "Pattern: " << pattern << endl;
    } else {
        cout << "No Pattern" << endl;
    }
}

int main() {
    string s;
    cin >> s;
    findPattern(s);
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    public static void findPattern(String s) {
        int n = s.length();
        int maxLen = 0;

        for (int len = 1; len <= n / 2; len++) {
            boolean match = true;
            for (int i = 0; i <= len; i++) {
                if (s.charAt(i) != s.charAt(i + len)) {
                    match = false;
                    break;
                }
            }
            if (match)
                maxLen = len;
        }

        if (maxLen > 0) {
            String pattern = s.substring(0, maxLen + 1);
            System.out.println("Pattern Length: " + (maxLen + 1));
            System.out.println("Pattern: " + pattern);
        } else {
            System.out.println("No Pattern");
        }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        findPattern(s);
    }
}`,
      python: `def findPattern(s):
    n = len(s)
    maxLen = 0

    for length in range(1, n // 2 + 1):
        match = True
        for i in range(0, length + 1):
            if s[i] != s[i + length]:
                match = False
                break
        if match:
            maxLen = length

    if maxLen:
        pattern = s[:maxLen + 1]
        print(f"Pattern Length: {maxLen + 1}")
        print(f"Pattern: {pattern}")
    else:
        print("No Pattern")

if __name__ == "__main__":
    s = input().strip()
    findPattern(s)`
    },
    supportedLanguages: ['c', 'cpp', 'java', 'python'],
    testCases: [
      { input: 'abcabcabcx', output: 'Pattern Length: 3\nPattern: abc' },
      { input: 'abcdef', output: 'No Pattern' }
    ],
    hiddenTestCases: [
      { input: 'aaaa', output: 'Pattern Length: 2\nPattern: aa' },
      { input: 'xyxyxy', output: 'Pattern Length: 2\nPattern: xy' },
      { input: 'aabaabaab', output: 'Pattern Length: 3\nPattern: aab' }
    ],
    timeLimit: 60,
    difficulty: 'Hard',
    complexity: 'O(n^2)'
  },

  // Q9: Detect Cycle in Directed Graph (C only, 4 bugs)
  {
    title: 'Detect Cycle in Directed Graph',
    description: 'The program uses DFS with an adjacency matrix to detect cycles in a directed graph. It tracks visited nodes and a recursion stack. However, the code has multiple bugs where return values are ignored, wrong nodes are checked, and the recursion stack is not properly reset. Find and fix all bugs!\n\nDO NOT MODIFY THE MAIN FUNCTION.',
    roundType: 1,
    inputFormat: 'First line: integer n (number of nodes)\nNext n lines: n integers each (adjacency matrix)',
    outputFormat: 'Cycle Detected or No Cycle',
    constraints: '1 <= n <= 100',
    sampleInput: '4\n0 1 0 0\n0 0 1 0\n0 0 0 1\n1 0 0 0',
    sampleOutput: 'Cycle Detected',
    starterCodeByLanguage: {
      c: `#include <stdio.h>
#include <stdbool.h>

bool dfs(int node, int n, int graph[n][n], bool visited[], bool stack[]) {
    visited[node] = true;
    stack[node] = true;

    for (int i = 0; i < n; i++) {
        if (graph[node][i]) {
            if (!visited[i])
                dfs(i, n, graph, visited, stack);

            else if (stack[node])
                return true;
        }
    }

    stack[node] = true;
    return false;
}

bool hasCycle(int n, int graph[n][n]) {
    bool visited[n];
    bool stack[n];

    for (int i = 0; i < n; i++) {
        visited[i] = false;
        stack[i] = false;
    }

    for (int i = 0; i < n; i++) {
        if (!visited[i])
            dfs(i, n, graph, visited, stack);
    }

    return false;
}

int main() {
    int n;
    scanf("%d", &n);

    int graph[n][n];
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            scanf("%d", &graph[i][j]);

    if (hasCycle(n, graph))
        printf("Cycle Detected");
    else
        printf("No Cycle");
    return 0;
}`
    },
    supportedLanguages: ['c'],
    testCases: [
      { input: '4\n0 1 0 0\n0 0 1 0\n0 0 0 1\n1 0 0 0', output: 'Cycle Detected' },
      { input: '3\n0 1 0\n0 0 1\n0 0 0', output: 'No Cycle' }
    ],
    hiddenTestCases: [
      { input: '2\n0 1\n1 0', output: 'Cycle Detected' },
      { input: '4\n0 1 0 0\n0 0 1 0\n0 0 0 0\n0 0 0 0', output: 'No Cycle' },
      { input: '3\n0 1 1\n0 0 1\n1 0 0', output: 'Cycle Detected' }
    ],
    timeLimit: 120,
    difficulty: 'Hard',
    complexity: 'O(V+E)'
  },

  // Q10: Fix the Power Function (infinite recursion bug)
  {
    title: 'Fix the Power Function',
    description: 'The following program computes the power of a number using recursion (a^b). However, it has a bug that causes infinite recursion. The post-decrement operator returns the original value before decrementing, so the recursive call never reduces the exponent. Find and fix the bug!\n\nDO NOT MODIFY THE MAIN FUNCTION - Only fix the power() function.',
    roundType: 1,
    inputFormat: 'Two integers a (base) and b (exponent) on separate lines',
    outputFormat: 'Result of a^b',
    constraints: '0 <= a <= 10, 0 <= b <= 15',
    sampleInput: '2\n10',
    sampleOutput: '1024',
    starterCodeByLanguage: {
      c: `#include <stdio.h>

int power(int a, int b) {
    if (b == 0)
        return 1;

    return a * power(a, b--);
}

int main() {
    int a, b;
    scanf("%d", &a);
    scanf("%d", &b);
    printf("%d", power(a, b));
    return 0;
}`,
      cpp: `#include <iostream>
using namespace std;

int power(int a, int b) {
    if (b == 0)
        return 1;

    return a * power(a, b--);
}

int main() {
    int a, b;
    cin >> a;
    cin >> b;
    cout << power(a, b);
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    public static int power(int a, int b) {
        if (b == 0)
            return 1;

        return a * power(a, b--);
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println(power(a, b));
    }
}`,
      python: `import sys
sys.setrecursionlimit(10000)

def power(a, b):
    if b == 0:
        return 1

    b_next = b
    return a * power(a, b_next)

if __name__ == "__main__":
    a = int(input().strip())
    b = int(input().strip())
    print(power(a, b))`
    },
    supportedLanguages: ['c', 'cpp', 'java', 'python'],
    testCases: [
      { input: '2\n10', output: '1024' },
      { input: '3\n0', output: '1' }
    ],
    hiddenTestCases: [
      { input: '5\n3', output: '125' },
      { input: '2\n15', output: '32768' },
      { input: '1\n10', output: '1' }
    ],
    timeLimit: 60,
    difficulty: 'Medium',
    complexity: 'O(n)'
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/fix-solve';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    await Problem.deleteMany({});
    console.log('Cleared existing problems');

    await Problem.insertMany(problems);
    console.log(`Seeded ${problems.length} problems successfully`);

    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();