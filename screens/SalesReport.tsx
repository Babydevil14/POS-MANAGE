import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Dimensions } from 'react-native';
import { supabase } from '../lib/supabase';
import { DrawerScreenProps } from '@react-navigation/drawer';
// @ts-ignore - This comment is added to ignore the missing type declarations for this library
import { BarChart } from 'react-native-chart-kit';
import { DrawerParamList } from '../Drawernavi'; // 1. Import the main DrawerParamList

// Define the type for our aggregated sales data
type SalesData = {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
};

// 2. Use the imported DrawerParamList to define this screen's props
type Props = DrawerScreenProps<DrawerParamList, 'Sales Summary'>;

// Component to render the sales summary screen
export default function SalesSummaryScreen({ navigation }: Props) {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        // Step 1: Fetch all records from transaction_items
        const { data: items, error: itemsError } = await supabase
          .from('transaction_items')
          .select('product_id, quantity, total_price');

        if (itemsError) {
          console.error('Error fetching transaction items:', itemsError);
          throw itemsError;
        }

        if (!items) {
          setLoading(false);
          return;
        }

        // Step 2: Aggregate the data by product_id
        const salesMap = new Map<string, { totalQuantity: number; totalRevenue: number }>();
        for (const item of items) {
          const existing = salesMap.get(item.product_id) || { totalQuantity: 0, totalRevenue: 0 };
          existing.totalQuantity += item.quantity;
          existing.totalRevenue += item.total_price;
          salesMap.set(item.product_id, existing);
        }

        // Step 3: Fetch product names for the aggregated product IDs
        const productIds = Array.from(salesMap.keys());
        if (productIds.length === 0) {
            setLoading(false);
            return;
        }
        
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('id, name')
          .in('id', productIds);

        if (productsError) {
          console.error('Error fetching product names:', productsError);
          throw productsError;
        }
        
        const productNameMap = new Map<string, string>(products.map(p => [p.id, p.name]));
        
        // Step 4: Combine aggregated data with product names and sort
        const combinedData: SalesData[] = Array.from(salesMap.entries()).map(([productId, data]) => ({
          productId,
          productName: productNameMap.get(productId) || 'Unknown Product',
          totalQuantity: data.totalQuantity,
          totalRevenue: data.totalRevenue,
        }));

        combinedData.sort((a, b) => b.totalQuantity - a.totalQuantity); // Sort by quantity sold

        setSalesData(combinedData);

      } catch (error) {
        console.error('Failed to generate sales report:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Generating Sales Report...</Text>
      </View>
    );
  }

  if (salesData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>📊 Sales Report</Text>
        <Text style={styles.emptyText}>No sales data available to generate a report.</Text>
      </View>
    );
  }
  
  // Prepare data for the bar chart (top 5 best sellers)
  const topSellers = salesData.slice(0, 5);
  const chartData = {
    labels: topSellers.map(item => item.productName.substring(0, 10)), // Shorten names for labels
    datasets: [
      {
        data: topSellers.map(item => item.totalQuantity),
      },
    ],
  };

  const renderItem = ({ item, index }: { item: SalesData, index: number }) => (
    <View style={styles.itemContainer}>
        <Text style={styles.rank}>#{index + 1}</Text>
        <View style={styles.itemDetails}>
            <Text style={styles.productName}>{item.productName}</Text>
            <Text style={styles.quantity}>Units Sold: {item.totalQuantity}</Text>
            <Text style={styles.revenue}>
                Total Revenue: {item.totalRevenue.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
            </Text>
        </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Sales Report</Text>
      <Text style={styles.subtitle}>Best Sellers by Units Sold</Text>
      
      {/* Bar Chart for Top 5 */}
      <View style={styles.chartContainer}>
        <BarChart
          data={chartData}
          width={Dimensions.get('window').width - 32} // from react-native
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: '#e26a00',
            backgroundGradientFrom: '#007bff',
            backgroundGradientTo: '#0056b3',
            decimalPlaces: 0, 
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#ffa726',
            },
          }}
          verticalLabelRotation={30}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>

      {/* Full List of All Products */}
      <FlatList
        data={salesData}
        renderItem={renderItem}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f7fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  rank: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#007bff',
      marginRight: 16,
      minWidth: 30,
  },
  itemDetails: {
      flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantity: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  revenue: {
    fontSize: 14,
    color: '#28a745',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
    color: '#666',
  },
});
