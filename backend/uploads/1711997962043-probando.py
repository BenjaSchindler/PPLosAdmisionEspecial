nums = [-2,0,1,1,2]


def threeSum(nums):
    nums.sort()
    f=0
    m = f+1
    l=len(nums)-1

    ans = []
    while (f != l):
        if nums[f]+nums[l]+nums[m] == 0:
            ans.append([nums[f],nums[l],nums[m]])
            f+=1
            m=f+1
            l-=1
            if m >= l:
                return ans 

        while nums[f]+nums[l]+nums[m] < 0:
            if l == m:
                return ans
            if m == l-1:
                f += 1
                m = f+1 
            else:
                m += 1
        while nums[f]+nums[l]+nums[m] > 0:
            if f == m:
                return ans
            if m == f+1:
                l -= 1
                m = l-1 
            else:
                m -= 1
        if nums[f]+nums[l]+nums[m]< 0:
            return ans

    return ans



print(threeSum(nums))


