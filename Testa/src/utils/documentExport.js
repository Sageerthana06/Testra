import { Share, Alert, Linking } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Mocks sharing an Invoice via WhatsApp
export const shareInvoiceWhatsApp = async (sale) => {
  try {
    const message = `*TESTRAA ERP INVOICE*\n` +
      `-----------------------------------------\n` +
      `*Invoice No:* ${sale.invoiceNumber}\n` +
      `*Customer:* ${sale.customerName}\n` +
      `*Date:* ${new Date(sale.createdAt).toLocaleDateString()}\n` +
      `*Total Amount:* $${sale.totalAmount.toFixed(2)}\n` +
      `*Paid Amount:* $${sale.paidAmount.toFixed(2)}\n` +
      `*Outstanding:* $${sale.outstandingAmount.toFixed(2)}\n` +
      `*Status:* ${sale.deliveryStatus.toUpperCase()}\n` +
      `-----------------------------------------\n` +
      `Thank you for doing business with TESTRAA!`;

    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;

    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      // Fallback to standard sharing if WhatsApp is not installed
      await Share.share({ message });
    }
  } catch (error) {
    Alert.alert('Error', 'Could not share invoice: ' + error.message);
  }
};

// Mocks exporting a PDF Document
export const exportInvoicePDF = async (sale) => {
  try {
    const filename = `Invoice_${sale.invoiceNumber}.pdf`;
    const fileUri = `${FileSystem.documentDirectory}${filename}`;

    // In a real implementation we would use expo-print or printToFileAsync.
    // For this boilerplate, we write a mock PDF placeholder.
    const pdfDummyContent = `%PDF-1.4\n1 0 obj\n<< /Title (Invoice ${sale.invoiceNumber}) >>\nendobj\n...`;
    await FileSystem.writeAsStringAsync(fileUri, pdfDummyContent);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      Alert.alert('PDF Exported', `Saved to document directory as ${filename}`);
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to generate PDF: ' + error.message);
  }
};

// Mocks exporting Excel Report
export const exportReportExcel = async (reportType, reportData) => {
  try {
    const filename = `${reportType}_Report_${Date.now()}.csv`;
    const fileUri = `${FileSystem.documentDirectory}${filename}`;

    // Generate CSV contents
    let csvContent = '';
    if (reportType === 'Sales') {
      csvContent = 'Invoice Number,Customer,Total Amount,Paid Amount,Outstanding,Status,Date\n';
      reportData.forEach(sale => {
        csvContent += `"${sale.invoiceNumber}","${sale.customerName}",${sale.totalAmount},${sale.paidAmount},${sale.outstandingAmount},"${sale.deliveryStatus}","${new Date(sale.createdAt).toLocaleDateString()}"\n`;
      });
    } else if (reportType === 'Stock') {
      csvContent = 'Product Name,SKU,Buy Price,Sell Price,Current Stock,Threshold\n';
      reportData.forEach(prod => {
        csvContent += `"${prod.name}","${prod.sku}",${prod.buyPrice},${prod.sellPrice},${prod.currentStock},${prod.lowStockThreshold}\n`;
      });
    } else {
      csvContent = JSON.stringify(reportData);
    }

    await FileSystem.writeAsStringAsync(fileUri, csvContent);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      Alert.alert('Excel (CSV) Exported', `Saved successfully as ${filename}`);
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to generate Excel report: ' + error.message);
  }
};
