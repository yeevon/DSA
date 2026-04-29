#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>
#include <string>

bool isNeg (int x) { return x < 0; }

int main() {

    // C style array
    int myArray[2];
    myArray[0] = 1;
    myArray[1] = 2;

    std::cout << myArray[0] << std::endl;


    // C++ Vector
    std::vector<int> oldestPeople = {122, 119, 117, 117, 116};
    int n;
    std::cin >> n;
    if (n >= 1 && n <= 5) {
        std::cout << oldestPeople.at(n-1) << std::endl;
    }
    // vector size
    std::cout << oldestPeople.size() << std::endl;

    for (std::size_t i = 0; i < oldestPeople.size(); ++i) {
        std::cout << oldestPeople.at(i) << std::endl;
    }

    // ranged base loop

    std::cout << std::endl;
    for (int o : oldestPeople) {
        std::cout <<  o << std::endl;
    }

    // vector initialisation patterns
    
    std::vector<int> a(5);          // 5 elements, each 0
    std::vector<int> b(5, -1);      // 5 elements, each -1
    std::vector<int> c = {3, 1, 4}; // 3 elements, listed explicitly
    std::vector<int> d;             // empty; push_back later

    // Drill 1 Find Max Value
    int maxVal = oldestPeople.at(0);

    for (std::size_t i = 1; i < oldestPeople.size(); ++i) {
        if (i > maxVal) {
            maxVal = i;
        }
    }

    std::cout << "The max value is " << maxVal << std::endl;

    // Drill 2 Count the Negatives
    std::vector<int> negPos = {1, -1, 0, 2, -2, 3};
    int negCount = 0;

    for (int val : negPos) {
        if (val < 0) {
            negCount++;
        }
    }

    std::cout << std::endl << "Neg count is " << negCount << std::endl;

    // Drill 3 bubble the largest value to the end
    std::size_t maxIdx = 0;

    for (std::size_t i = 1; i < oldestPeople.size(); ++i) {
        if (oldestPeople.at(i) > oldestPeople.at(maxIdx)) {
            maxIdx = i;
        }
    }

    std::swap(oldestPeople.at(maxIdx), oldestPeople.at(oldestPeople.size() - 1));
    
    std::cout << std::endl;
    for (int curr : oldestPeople) {
        std::cout << curr << std::endl;
    }

    // Reverse Loop Pattern
    // Loop while i > 0, then handle 0 seperately:
    for (std::size_t i = oldestPeople.size(); i-- > 0;) {
        // i now takes values  size-1, size-2, ..., 0
    }

    // algorithm & numeric alternatives

    // Sum of all elements
    int total = std::accumulate(oldestPeople.begin(), oldestPeople.end(), 0);

    // Maxiumu element (returns an interator; dereference with *)
    int a_maxVal = *std::max_element(oldestPeople.begin(), oldestPeople.end());

    // Count elements matching a condtion
    int negCount = std::count_if(negPos.begin(), negPos.end(), [](int x) { return x < 0; });
    // OR
    int negCount = std::count_if(negPos.begin(), negPos.end(), isNeg ); // See line 6 for isNeg


    // Parllel-Vectors technique - Bad pracitice for the most part
    std::vector<std::string> ctryNames(5);
    std::vector<int> ctryMins(5);    

    ctryNames.at(0) = "China";      ctryMins.at(0) = 155;
    ctryNames.at(1) = "Sweden";     ctryMins.at(1) = 154;
    ctryNames.at(2) = "Russia";     ctryMins.at(2) = 246;
    ctryNames.at(3) = "UK";         ctryMins.at(3) = 216;
    ctryNames.at(4) = "USA";        ctryMins.at(4) = 274;

    std::string userCountry;
    std::cout << "What Country are you from: ";
    std::cin >> userCountry;

    // Now you can have 1 for loop that aligns with both vectors
    for (std::size_t i = 0; i < ctryNames.size(); ++i) {
        if (ctryNames.at(i) == userCountry) {
            std::cout << ctryMins.at(i) << '\n';
            break;
        }
    }

    // User algorithm instead of loop to search the two vectors
    auto it = std::find(ctryNames.begin(), ctryNames.end(), userCountry);
    if (it != ctryNames.end()) {
        std::size_t i = it - ctryNames.begin(); // index of the iterator
        std::cout << ctryMins.at(i) << '\n';
    }

    // Good Practice Use Strcts instead of parallel Vectors
    struct Country {
        std::string name;
        int minutesTV;
    };

    std::vector<Country> countries = {
        {"China", 155},
        {"Sweden", 154},
        {"Russia", 246},
        {"UK", 216},
        {"USA", 274}
    };

    for (const Country& c: countries) {
        if (c.name == userCountry) {
            std::cout << c.minutesTV << '\n';
            break;
        }
    }

    // Resize as you pushback
    std::vector<int> v;
    int n;
    std::cout << "Set vector size: ";
    std::cin >> n;

    for (int i = 0; i < n; ++i) {
        int x;
        std::cin >> x;
        v.push_back(x);
    }

    
}
