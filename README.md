```
DOKANMATE1
├─ app
│  ├─ (tabs)
│  │  ├─ dues
│  │  │  ├─ add.js
│  │  │  ├─ index.js
│  │  │  └─ [id].js
│  │  ├─ expenses
│  │  │  ├─ add.js
│  │  │  └─ index.js
│  │  ├─ index.js
│  │  ├─ inventory
│  │  │  ├─ add.js
│  │  │  ├─ index.js
│  │  │  └─ [id].js
│  │  ├─ sales
│  │  │  ├─ cart.js
│  │  │  ├─ index.js
│  │  │  └─ success.js
│  │  └─ _layout.js
│  └─ _layout.js
├─ App.js
├─ app.json
├─ assets
│  ├─ adaptive-icon.png
│  ├─ favicon.png
│  ├─ icon.png
│  └─ splash-icon.png
├─ index.js
├─ package-lock.json
├─ package.json
└─ src
   ├─ api
   │  └─ client.js
   ├─ components
   │  ├─ common
   │  │  ├─ Badge.js
   │  │  ├─ Button.js
   │  │  ├─ Card.js
   │  │  ├─ EmptyState.js
   │  │  ├─ Input.js
   │  │  ├─ SearchBar.js
   │  │  └─ Toast.js
   │  ├─ dues
   │  │  ├─ CustomerCard.js
   │  │  └─ TransactionRow.js
   │  ├─ expenses
   │  │  └─ ExpenseItem.js
   │  ├─ inventory
   │  │  └─ ProductCard.js
   │  └─ sales
   │     ├─ CartItem.js
   │     └─ ProductPickerRow.js
   ├─ constants
   │  ├─ colors.js
   │  └─ config.js
   ├─ context
   │  └─ AppContext.js
   ├─ database
   │  ├─ db.js
   │  ├─ migrations.js
   │  └─ queries
   │     ├─ customers.js
   │     ├─ expenses.js
   │     ├─ products.js
   │     ├─ sales.js
   │     └─ syncQueue.js
   ├─ hooks
   │  ├─ useCustomers.js
   │  ├─ useDashboard.js
   │  ├─ useExpenses.js
   │  ├─ useNetwork.js
   │  └─ useProducts.js
   ├─ navigation
   │  ├─ AppNavigator.js
   │  └─ TabNavigator.js
   ├─ screens
   │  ├─ Dashboard
   │  │  └─ DashboardScreen.js
   │  ├─ Dues
   │  │  ├─ AddCustomerScreen.js
   │  │  ├─ CustomerDetailScreen.js
   │  │  └─ DuesScreen.js
   │  ├─ Expenses
   │  │  ├─ AddExpenseScreen.js
   │  │  └─ ExpensesScreen.js
   │  ├─ Inventory
   │  │  ├─ AddProductScreen.js
   │  │  ├─ EditProductScreen.js
   │  │  └─ InventoryScreen.js
   │  └─ Sales
   │     ├─ CartScreen.js
   │     ├─ SalesScreen.js
   │     └─ SaleSuccessScreen.js
   ├─ services
   │  └─ syncService.js
   └─ utils
      └─ formatters.js

```
