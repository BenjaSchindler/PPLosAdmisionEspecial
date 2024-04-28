strs = ["eat","tea","tan","ate","nat","bat"]

def groupAnagrams(strs):
    x = []
    for ana in strs:
        x.append(sorted(ana))
        print(x)
    x.sort()
    print(x)
    z=0
    sub = []
    final = []
    for y in range(1, len(x)):
        if x[z] == x[y]:
            sub.append(x[y])
        else:
            sub.append(x[z])
            z = y
            final.append(sub)
            sub = []
    return final


print(groupAnagrams(strs))
