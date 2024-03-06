uniq = []
S = []

with open('all_equipment.txt', 'r+') as file:
    for line in file:
        a, b, c, d = line.strip().split(' ^ ')
        if not c.startswith('/wiki/'):
            print(line)
        if c not in uniq:
            uniq.append(c)
            S.append(line)

# with open('all_equipment.txt', 'w') as file:
#     for line in S:
#         file.write(line)