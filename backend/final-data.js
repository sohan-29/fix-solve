question1 = `
#include <stdio.h>
int main() {
char arr[5] = "Hello"; // BUG: needs 6 (5 chars + '\0')
printf("%s\n", arr);
}
correct version:
`;

question2 = `QUESTION TWO:
C
#include <stdio.h>
int main() {
int x = 2147483647; // max int
printf("%d\n", x+1); // BUG: overflow
}
`
question3 = `#include <stdio.h>
#include <pthread.h>

pthread_mutex_t lock1 = PTHREAD_MUTEX_INITIALIZER;
pthread_mutex_t lock2 = PTHREAD_MUTEX_INITIALIZER;

void* task1(void* arg) {
    pthread_mutex_lock(&lock1);
    printf("Task1 locked lock1\n");

    pthread_mutex_lock(&lock2);   // may cause deadlock
    printf("Task1 locked lock2\n");

    pthread_mutex_unlock(&lock2);
    pthread_mutex_unlock(&lock1);

    return NULL;
}

void* task2(void* arg) {
    pthread_mutex_lock(&lock2);
    printf("Task2 locked lock2\n");

    pthread_mutex_lock(&lock1);   // opposite order → deadlock
    printf("Task2 locked lock1\n");

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

question4 = `Description: Write a function to check if a string is a palindrome, considering only alphanumeric characters and ignoring cases.
C:
#include <stdio.h>
#include <string.h>
#include <ctype.h>
#include <stdbool.h>
bool isPalindrome(char *s) {
    int left = 0;
    int right = strlen(s) - 1;
    while(left < right) {
        while(!isalnum(s[left])) left++;
        while(!isalnum(s[right])) right--;
 
        if(tolower(s[left]) != tolower(s[right]))
            return false;
        
        left++;
        right--;
    }
    return true;
}
`;

question5 = `
Complete the insertion sort function in such a way that they produce ascending order of elements
C:
#include <stdio.h>

void insertionSort(int arr[], int n){
    for(int i=1;i<n;i++){
        int key=arr[i];
        int j=i-1;

        while(arr[j] > key){   // ❌ Missing j >= 0 check
            arr[j+1]=arr[j];
            j--;
        }

        arr[j+1]=key;
    }
}

int main(){
    int arr[]={5,2,4,6,1,3};
    int n=6;

    insertionSort(arr,n);

    for(int i=0;i<n;i++)
        printf("%d ",arr[i]);
}
`;

question6 = `VALID ANAGRAM
C:
#include <stdio.h>
#include <string.h>
#include <stdbool.h>

bool isAnagram(char *s, char *t) {
    if(strlen(s) != strlen(t)) return false;
    
    int count[26] = {0};
    
    for(int i = 0; i < strlen(s); i++) {
        count[s[i] - 'a']++;
    }
    
    for(int i = 0; i < strlen(t); i++) {
        count[t[i] - 'a']--;
    }
    
    for(int i = 0; i < 26; i++) {
        if(count[i] != 0) return false;
    }
    
    return true;
}
`;

question7 = `
Given an array, count the number of segments of strictly increasing numbers.
Example:
Input array: 1 2 3 1 2 5
Increasing segments:
1 2 3
1 2 5
Output:
2
1️⃣ C Language
❌ Buggy Code
#include <stdio.h>
#include <stdbool.h>
int main()
{
    int arr[] = {1,2,3,1,2,5};
    int n = sizeof(arr);   // BUG 1
    int count = 0;
    bool increasing;
    for(int i = 1; i <= n; i++)   // BUG 2  {
        if(arr[i] >= arr[i-1])    // BUG 3   {
            increasing = true;
        }
        else    {
            if(increasing = true) // BUG 4
                count++;
        }
    }
    if(increasing)
        count--;
    printf("%d", count);
}
Test Case
Array = [1 2 3 1 2 5]
Expected Output
2
Output From Buggy Code
5
`;

question8 = `
Problem: Longest Repeating Prefix Pattern

Given a string S, determine the longest prefix pattern that repeats consecutively at least twice at the start of the string.
If no repeating pattern exists, print "No Pattern".
Input
abcabcabcx
Expected Output
Pattern Length: 3
Pattern: abc
C Buggy Code
#include <stdio.h>
#include <string.h>
#include <stdbool.h>
int main()
{
    char s[100];
    printf("Enter string: ");
    scanf("%s", s);
    int n = strlen(s);
    int maxLen = 0;
    for(int len = 1; len <= n/2; len++)      // BUG 1   {
        bool match = true;
        for(int i = 0; i <= len; i++)        // BUG 2     {
            if(s[i] != s[i + len])           // BUG 3     {
                match = false;
            }
        }
        if(match)
            maxLen = len;
    }
    if(maxLen){
   char pattern[100];
        strncpy(pattern, s, maxLen+1);       // BUG 4
        pattern[maxLen+1] = '\0';
        printf("Pattern Length: %d\n", maxLen);
        printf("Pattern: %s\n", pattern);
    }
    else
        printf("No Pattern\n");
    return 0;
}`;

question9 =`Problem: Detect Cycle in a Directed Graph
You are given a directed graph represented using a HashMap (dictionary) where:
Key → Node
Value → List of nodes it points to (neighbors)
Write a program to determine whether the graph contains a cycle.
The program uses DFS with a HashMap to track visited nodes and recursion stack.
However, the given code contains logical bugs.
Your task is to identify and fix the bugs so that the program correctly detects cycles.
📥 Input Format
First line → integer n (number of nodes)
Next n lines:
First value → node
Second value → number of neighbors k
Next k values → neighbors
Example input line format:
Copy code
node k neighbor1 neighbor2 ... neighbork
📤 Output Format
Print:
Cycle Detected
or
No Cycle
1️⃣ C PROGRAM
Buggy C Code
#include <stdio.h>
#include <stdbool.h>

bool dfs(int node, int n, int graph[n][n], bool visited[], bool stack[])
{
    visited[node] = true;
    stack[node] = true;

    for(int i = 0; i < n; i++)
    {
        if(graph[node][i])
        {
            if(!visited[i])
                dfs(i, n, graph, visited, stack);   // BUG 1: result ignored

            else if(stack[node])                    // BUG 2: wrong node checked
                return true;
        }
    }

    stack[node] = true;                             // BUG 3: should be false
    return false;
}

bool hasCycle(int n, int graph[n][n])
{
    bool visited[n];
    bool stack[n];

    for(int i=0;i<n;i++)
    {
        visited[i] = false;
        stack[i] = false;
    }

    for(int i=0;i<n;i++)
    {
        if(!visited[i])
            dfs(i,n,graph,visited,stack);           // BUG 4: result ignored
    }

    return false;
}

int main()
{
    int n;
    printf("Enter number of nodes: ");
    scanf("%d",&n);

    int graph[n][n];

    printf("Enter adjacency matrix:\n");
    for(int i=0;i<n;i++)
        for(int j=0;j<n;j++)
            scanf("%d",&graph[i][j]);

    if(hasCycle(n,graph))
        printf("Cycle Detected");
    else
        printf("No Cycle");
}
`;

question10 = `Write a program to compute the power of a number using recursion.
Given two integers:
•	a → base
•	b → exponent
Compute: a^b
1️⃣ C++ PROGRAM
❌ Buggy Code (Infinite Recursion Bug)
#include <iostream>
using namespace std;

int power(int a,int b)
{
    if(b==0)
        return 1;

    return a * power(a,b--);   // BUG
}

int main()
{
    int a,b;

    cout<<"Enter base: ";
    cin>>a;

    cout<<"Enter exponent: ";
    cin>>b;

    cout<<"Result: "<<power(a,b);
}
`