# Ryder Cup Analysis - User Guide

## 🚀 Quick Start

The application is now running at: **http://localhost:5173**

---

## 📊 Feature Overview

### Dashboard Tab
**Purpose**: Get a quick overview of model performance

**Features**:
- 📈 Overall accuracy metric
- 📊 Performance vs random baseline alert
- 🎯 Accuracy by outcome type (US Win, EU Win, Draw)
- 📉 Error rates and precision metrics
- ⚡ Hover effects for interactive feedback

**How to Use**:
1. View the alert banner to see how the model compares to random chance
2. Check each card for detailed metrics
3. Hover over cards to see them highlight

---

### Matches Tab
**Purpose**: Explore individual match predictions in detail

**New Features**:
- 🔍 **Search Bar**: Search by Match ID, Round, or Outcome
- 🎯 **Advanced Filters**: 
  - All matches
  - Correct predictions only
  - Incorrect predictions only
- 📊 **Sortable Columns**:
  - Click "Round" header to sort by round
  - Click "Result" header to sort by accuracy
  - Click again to reverse order
- 📈 **Results Counter**: Shows how many matches match your criteria

**How to Use**:
1. Use the search bar to find specific matches (e.g., "5001", "Round 3")
2. Click filter buttons to focus on correct or incorrect predictions
3. Click column headers to sort data
4. Look for visual indicators (green ✓ for correct, red ✗ for wrong)

---

### Charts Tab
**Purpose**: Visualize accuracy trends across tournament rounds

**New Features**:
- 📈 **Trend Line**: Statistical trend analysis using linear regression
- 📊 **Reference Lines**:
  - Gray dashed: Average accuracy
  - Red dashed: Random chance baseline (33.3%)
- 🎯 **Trend Badge**: Shows if performance is improving/declining
- 🔄 **Toggle Control**: Show/hide trend line

**How to Use**:
1. Observe the bars to see round-by-round performance
2. Check the trend line to see overall trajectory
3. Compare to reference lines to gauge performance
4. Click "Hide Trend" to focus on raw data
5. Read the performance trend summary below the chart

**Interpreting the Trend**:
- **Improving**: Slope is positive (performance getting better)
- **Declining**: Slope is negative (performance getting worse)
- **Stable**: Slope near zero (consistent performance)

---

### Matrix Tab
**Purpose**: Understand prediction errors with confusion matrix

**Features**:
- 🎯 Visual heatmap of predictions vs actuals
- ✅ Green borders on diagonal (correct predictions)
- 📊 Color intensity shows frequency
- 📝 Explanatory text

**How to Use**:
1. Find your predicted outcome in the rows
2. Find the actual outcome in the columns
3. The intersection shows the count
4. Diagonal cells (green borders) are correct predictions
5. Off-diagonal cells are errors

---

### Confidence Tab
**Purpose**: Analyze relationship between confidence and accuracy

**New Features**:
- 📍 **Confidence Thresholds**:
  - Green line: High confidence (60%)
  - Yellow line: Medium confidence (40%)
  - Red line: Random baseline (33.3%)
- 🎯 **Dual Scatter Plot**:
  - Green dots: Correct predictions
  - Red dots: Incorrect predictions
- 📊 **Statistics Cards**: Accuracy by confidence level

**How to Use**:
1. Look for patterns in the scatter plot
2. Check if high-confidence predictions are more accurate
3. Identify problematic low-confidence correct predictions
4. Review confidence level statistics cards

---

### Insights Tab
**Purpose**: Get actionable recommendations for model improvement

**Features**:
- 🔔 Prioritized recommendations
- 📋 Detailed statistics on model issues
- 💡 Actionable suggestions
- 🎯 Next steps roadmap

**How to Use**:
1. Read through each recommendation
2. Note the priority (critical, warning, improvement)
3. Review suggested actions
4. Follow the next steps roadmap

---

## 💾 Export Options

### CSV Export
**What it includes**:
- Round, Match ID
- Probability scores
- Predicted vs Actual outcomes
- Correctness flag

**Best for**:
- Importing into Excel/Google Sheets
- Further statistical analysis
- Data archiving

### JSON Export
**What it includes**:
- Complete match data
- All metrics and statistics
- Confusion matrix
- Metadata (export date, counts)

**Best for**:
- Programmatic analysis
- API integration
- Complete data backup

### Summary Report
**What it includes**:
- Executive summary
- Key performance metrics
- Breakdown by outcome and round
- Critical findings

**Best for**:
- Quick sharing with stakeholders
- Email reports
- Documentation
- Management presentations

**How to Export**:
1. Click the appropriate export button in the header
2. File downloads automatically to your Downloads folder
3. Filename includes descriptive name and type

---

## 🎯 Tips & Tricks

### Finding Insights Quickly
1. **Check the Alert Banner**: Immediately see if model beats random chance
2. **Use Trend Badge**: Quickly see if performance is improving
3. **Filter to Incorrect**: Focus on what went wrong
4. **Search by Round**: Analyze specific tournament stages

### Analyzing Performance
1. **Compare to Baselines**: 
   - Random chance: 33.3%
   - Your average: Shown on charts
2. **Look for Patterns**:
   - Which rounds performed worst?
   - Which outcome types are most accurate?
   - Is confidence correlated with accuracy?

### Best Practices
1. **Start with Dashboard**: Get the big picture
2. **Dive into Matches**: Understand specific cases
3. **Check Charts**: See trends
4. **Review Matrix**: Understand error patterns
5. **Read Insights**: Get recommendations
6. **Export Summary**: Share findings

---

## ⚡ Keyboard Shortcuts

- **Search**: Click search bar or tab to focus
- **Clear Search**: Click "Clear" button or delete text
- **Sort**: Click column headers
- **Export**: Use header buttons

---

## 🎨 Color Guide

### Performance Colors
- 🟢 **Green**: Good (≥70%)
- 🟡 **Yellow**: Fair (50-69%)
- 🔴 **Red**: Poor (<50%)

### Team Colors
- 🔵 **Blue**: US Team predictions
- 🔴 **Red**: EU Team predictions
- ⚪ **Gray**: Draw predictions

### Status Indicators
- ✅ **Green Check**: Correct prediction
- ❌ **Red X**: Incorrect prediction
- ⚠️ **Warning**: Critical issue
- 💡 **Lightbulb**: Insight/recommendation

---

## 🆘 Troubleshooting

### Chart not showing?
- Refresh the page
- Check browser console for errors
- Ensure data loaded successfully

### Search not working?
- Try clearing filters first
- Check spelling
- Use partial matches (e.g., "50" instead of "5001")

### Export failed?
- Check browser download settings
- Ensure pop-ups are allowed
- Try a different format

---

## 📞 Support

For issues or questions:
1. Check this user guide
2. Review IMPROVEMENTS.md for feature details
3. Check CHANGELOG.md for recent changes
4. Review README.md for setup instructions

---

**Version**: 1.1.0  
**Last Updated**: October 6, 2025  
**Status**: ✅ Active

