// ==============================================
// QUESTIONS CONFIGURATION
// Add new questions here following the same structure
// ==============================================

const QUESTIONS = {
    fizzbuzz: {
        title: "FizzBuzz",
        difficulty:"Medium",
        description: `
            <p>Write a function that prints the numbers from 1 to n. But for multiples of 3, print "Fizz" instead of the number, and for the multiples of 5, print "Buzz". For numbers that are multiples of both 3 and 5, print "FizzBuzz".</p>
        `,
        example: `
            <p><strong>Example:</strong></p>
            <pre>Input: n = 15
Output:
1
2
Fizz
4
Buzz
Fizz
7
8
Fizz
Buzz
11
Fizz
13
14
FizzBuzz</pre>
        `,
        testCases: [
            {
                input: "15",
                output: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz"
            },
            {
                input: "5",
                output: "1\n2\nFizz\n4\nBuzz"
            },
            {
                input: "30",
                output: `1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz\nFizz\n22\n23\nFizz\nBuzz\n26\nFizz\n28\n29\nFizzBuzz`
            }
        ],
        starterCode: `#include <iostream>
using namespace std;

void fizzBuzz(int n) {
    // Write your code here
    
}

int main() {
    // Test your function
    fizzBuzz(15);
    return 0;
}`,
        // comments: [
        //     {
        //         author: "John Doe",
        //         text: "Remember to handle edge cases like n=0!",
        //         date: "June 1, 2023"
        //     },
        //     {
        //         author: "Jane Smith",
        //         text: "You can optimize by checking divisible by 15 first.",
        //         date: "June 3, 2023"
        //     }
        // ]
    },

    factorial: {
        title: "Factorial",
        difficulty:"Easy",
        description: `
            <p>Write a function to calculate the factorial of a given non-negative integer n. The factorial of n (denoted as n!) is the product of all positive integers from 1 to n.</p>
            <p><strong>Note:</strong> By definition, 0! = 1.</p>
        `,
        example: `
            <p><strong>Example:</strong></p>
            <pre>Input: n = 5
Output: 120

Explanation: 5! = 5 × 4 × 3 × 2 × 1 = 120</pre>
        `,
        testCases: [
            {
                input: "5",
                output: "120"
            },
            {
                input: "0",
                output: "1"
            },
            {
                input: "7",
                output: "5040"
            }
        ],
        starterCode: `#include <iostream>
using namespace std;

int factorial(int n) {
    // Write your code here
    
}

int main() {
    int n = 5;
    cout << factorial(n) << endl;
    return 0;
}`,
        // comments: [
        //     {
        //         author: "Alice Johnson",
        //         text: "Don't forget to handle the base case for n = 0!",
        //         date: "June 5, 2023"
        //     },
        //     {
        //         author: "Bob Wilson",
        //         text: "You can implement this both recursively and iteratively.",
        //         date: "June 6, 2023"
        //     }
        // ]
    },

    palindrome: {
        title: "Palindrome Check",
        difficulty:"Hard",
        description: `
            <p>Write a function to check if a given string is a palindrome. A palindrome is a word, phrase, number, or other sequence of characters that reads the same forward and backward.</p>
            <p><strong>Note:</strong> Consider only alphanumeric characters and ignore case.</p>
        `,
        example: `
            <p><strong>Example:</strong></p>
            <pre>Input: s = "A man a plan a canal Panama"
Output: true

Input: s = "race a car"
Output: false</pre>
        `,
        testCases: [
            {
                input: "A man a plan a canal Panama",
                output: "true"
            },
            {
                input: "race a car",
                output: "false"
            },
            {
                input: "Madam",
                output: "true"
            }
        ],
        starterCode: `#include <iostream>
#include <string>
#include <algorithm>
#include <cctype>
using namespace std;

bool isPalindrome(string s) {
    // Write your code here
    
}

int main() {
    string s = "A man a plan a canal Panama";
    cout << (isPalindrome(s) ? "true" : "false") << endl;
    return 0;
}`,
        // comments: [
        //     {
        //         author: "Charlie Brown",
        //         text: "Remember to handle spaces and punctuation correctly!",
        //         date: "June 8, 2023"
        //     },
        //     {
        //         author: "Diana Prince",
        //         text: "Two-pointer approach works well for this problem.",
        //         date: "June 9, 2023"
        //     }
        // ]
    },

    fibonacci: {
        title: "Fibonacci Sequence",
        difficulty:"Easy",
        description: `
            <p>Write a function to generate the first n numbers of the Fibonacci sequence. The Fibonacci sequence is defined as:</p>
            <p>F(0) = 0, F(1) = 1, and F(n) = F(n-1) + F(n-2) for n > 1.</p>
        `,
        example: `
            <p><strong>Example:</strong></p>
            <pre>Input: n = 8
Output: 0 1 1 2 3 5 8 13</pre>
        `,
        testCases: [
            {
                input: "8",
                output: "0 1 1 2 3 5 8 13"
            },
            {
                input: "5",
                output: "0 1 1 2 3"
            },
            {
                input: "1",
                output: "0"
            }
        ],
        starterCode: `#include <iostream>
using namespace std;

void fibonacci(int n) {
    // Write your code here
    // Print the first n Fibonacci numbers separated by spaces
    
}

int main() {
    int n = 8;
    fibonacci(n);
    return 0;
}`,
        // comments: [
        //     {
        //         author: "Eva Martinez",
        //         text: "Consider the efficiency of your approach - iterative vs recursive.",
        //         date: "June 12, 2023"
        //     },
        //     {
        //         author: "Frank Thompson",
        //         text: "Handle edge cases like n = 0 and n = 1 carefully.",
        //         date: "June 13, 2023"
        //     }
        // ]
    }
};

// Function to get question by key
function getQuestion(key) {
    return QUESTIONS[key];
}

// Function to get all question keys
function getAllQuestionKeys() {
    return Object.keys(QUESTIONS);
}