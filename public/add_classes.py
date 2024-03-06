classes = []

with open('classes_in_file_order.txt', 'r') as f:
    classes = f.readline().split(' ')

new_lines = []

i = -1
with open('all_equipment.txt', 'r') as f:
    for line in f:
        row = line.strip().split(' ^ ')
        long = row[-1].endswith(' X') or row[-1].endswith(' E')
        if long:
            row[-1] = row[-1][:-2]

        if i == -1 or i == len(classes):
            new_lines.append([*row, 'noclass'])
        else:
            new_lines.append([*row, classes[i]])
        
        if long:
            i += 1

with open('equipment_with_classes.txt', 'w') as f:
    for line in new_lines:
        f.write(' ^ '.join(line) + '\n')