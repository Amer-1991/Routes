function mergeData(originalData, newData) {
    const mergedData = [...originalData];
    const existingIds = new Set(originalData.map(item => item.websiteId));

    newData.forEach(item => {
        if (!existingIds.has(item.websiteId)) {
            mergedData.push(item);
            existingIds.add(item.websiteId);
            console.log(`New entry with websiteId ${item.websiteId} added.`);
        } else {
            console.log(`Duplicate entry with websiteId ${item.websiteId} skipped during merge.`);
        }
    });

    console.log('Data merge completed. Total items after merge:', mergedData.length);
    return mergedData;
}

module.exports = { mergeData };