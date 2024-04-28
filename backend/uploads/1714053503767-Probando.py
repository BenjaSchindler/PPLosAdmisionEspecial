strs = ["tat","tez","tan","ata","nar","nat"]

def groupAnagrams(strs):
    final = []
    sub = []
    x = 0
    while len(strs) != 0:

        if x == 0:
            sub.append(strs[0])
        elif sorted(strs[0]) == sorted(strs[x]):
            sub.append(strs[x])
            strs.pop(x)
            x -= 1
        x += 1

        if x>=len(strs):
            final.append(sub)
            strs.pop(0)
            sub = []
            x = 0

    return final
        
        

print(groupAnagrams(strs))
