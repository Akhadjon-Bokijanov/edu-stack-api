import java.util.*;
import java.io.*;
/*
 * @author Jerry Heuring
 *  Test class for the Project 0
 */
public class Project0Helper {
  protected ArrayList<Integer> zipList; 
  long startTime, endTime;
  int outOfOrder, missingZip;
  /*
   * Constructor -- does initial setup and initialization.
   */
  public Project0Helper() {
    zipList = new ArrayList<Integer> (100);
    startTime = 0;
    endTime = 0;
    outOfOrder = 0;
    missingZip = 0;
  }

  public 

  /*
   * This checks the initial group of addresses and starts the
   * timer for the run.
   * @param mailingList  The list of addresses in their original order.
   */
  public void checkStartingOrder(MailAddressInterface mailingList[]) {
    for (int i = 0; i < mailingList.length; i++) {
      if (mailingList[i] != null) {
        zipList.add(mailingList[i].getZipCode());
      }
    }
    startTime = System.currentTimeMillis();
  }
  
  /*
   * This method will check for some error conditions in the data
   * such as addresses not in ascending order and mismatches in terms
   * of zip codes.  
   * It also outputs the time for the sort.
   * 
   * @param mailingList  The list of addresses in sorted order.
   */
  public void checkFinalOrder(MailAddressInterface mailingList[]) {
    int finalListSize = mailingList.length;
    
    endTime = System.currentTimeMillis();
    for (int i = 0; i < mailingList.length; i++) {
      if (mailingList[i] == null) {
        finalListSize = i;
        break;
      }
    }

    if (zipList.size() != finalListSize) {
      System.out.println("Final list size does not match initial list size!");
      System.out.println("Initial List Size = " + zipList.size() );
      System.out.println("Final List Size = " + finalListSize);
    } else {
      System.out.println("Initial and Final list sizes match.");
    }
    
    for (int i=1; i < finalListSize; i++) {
      if (mailingList[i-1].getZipCode() > mailingList[i].getZipCode()) {
        System.out.println("Zip Code Out of Order");
        System.out.println("Address " + (i-1));
        System.out.println(mailingList[i-1]);
        System.out.println("Address " + (i));
        System.out.println(mailingList[i]);
        outOfOrder++;
      }
    }
    
    zipList.sort(null);
    for (int i = 0; i < finalListSize; i++) {
      if (mailingList[i].getZipCode() != zipList.get(i).intValue()) {
        System.out.println("Expecting to see zip code "+zipList.get(i).intValue());
        System.out.println("Found: ");
        System.out.println(mailingList[i]);
        missingZip++;
      }
    }
    
    System.out.println("Time Taken = "+(endTime - startTime)+" msec");
  }
  /*
   * Main program reads in a test file and uses it.  The class
   * ConcreteMailClass implements the MailAddressInterface.  The
   * ConcreteMailClass is NOT supplied -- you need to make your
   * own implementation of the ConcreteMailAddress class and then 
   * you can substitute it in here if you wish.  
   * @param args  command line arguments -- not used.
   */

  public int getMailAddressWithMaximumZipCode(int arr[]) 
    { 
        int mx = arr[0];
        for (int i = 1; i < arr.length; i++) 
            if (arr[i] > mx) 
                mx = arr[i]; 
        return mx; 
    }

  public void countSort(int arr[], int exp) 
    { 
        int i;
        int n = arr.length; 
        int output[] = new int[n]; // output array 
        int count[] = new int[10]; 
        Arrays.fill(count, 0); 
  
        // Store count of occurrences in count[] 
        for (i = 0; i < n; i++) 
            count[ (arr[i]/exp)%10 ]++; 
  
        // Change count[i] so that count[i] now contains 
        // actual position of this digit in output[] 
        for (i = 1; i < 10; i++) 
            count[i] += count[i - 1]; 
  
        // Build the output array 
        for (i = n - 1; i >= 0; i--) 
        { 
            output[count[ (arr[i]/exp)%10 ] - 1] = arr[i]; 
            count[ (arr[i]/exp)%10 ]--; 
        } 
  
        // Copy the output array to arr[], so that arr[] now 
        // contains sorted numbers according to curent digit 
        for (i = 0; i < n; i++) 
            arr[i] = output[i]; 
    }

    // The main function to that sorts arr[] of size n using 
    // Radix Sort 
    public static void radixsort(int arr[]) 
    { 
        // Find the maximum number to know number of digits 
        int m = getMailAddressWithMaximumZipCode(arr);
      /*  
        ConcreteMailAddress m = new ConcreteMailAddress();
        m = getMailAddressWithMaximumZipCode(arr);
      */  

        int n = arr.length; 
  
        // Do counting sort for every digit. Note that instead 
        // of passing digit number, exp is passed. exp is 10^i 
        // where i is current digit number 
        for (int exp = 1; m/exp > 0; exp *= 10) 
            countSort(arr, exp); 
    } 
   

  public static void main(String[] args) {
    // TODO Auto-generated method stub
    MailAddressInterface myList[] = new ConcreteMailAddress[100];
    Project0Helper helper = new Project0Helper();
    int zipCodeArray[] = new int[100];
    Arrays.fill(zipCodeArray, 0);
    Scanner myscanner;
    try {
      myscanner = new Scanner(new File("test.txt") );
      try {
        for (int i= 0; i < 100; i++) {
          String name = myscanner.nextLine();
          String address1 = myscanner.nextLine();
          String address2 = myscanner.nextLine();
          String city = myscanner.nextLine();
          String state = myscanner.nextLine();
          int zip = myscanner.nextInt();
          myscanner.nextLine();  // get rid of the rest of the line after the zip code
          myList[i] = new ConcreteMailAddress(name, address1, address2, city, state, zip);
          System.out.println(myList[i]);
        }
        


      } catch(NoSuchElementException e) {
        // end of input?
      }
      for(int i = 0; i < myList.length; i++)
        zipCodeArray[i] = myList[i].getZipCode();

      helper.radixsort(zipCodeArray);

        /*
            HERE IMPLEMENT YOUR CODE TO WRITE THE RESULT INTO OUTPUT FILE
            THE FOLLOWING CODE IS FOR TESTING PURPOSES
        */
        for(int i = 0; i < zipCodeArray.length; i++) {
          for(int j = 0; j < myList.length; j++) {
            if (myList[j].getZipCode() == zipCodeArray[i]) {
              // HERE YOU SHOULD WRITE TO OUTPUT FILE
              System.out.println(myList[j].getName());
            }
          }
        } 


      helper.checkStartingOrder(myList);
      helper.checkFinalOrder(myList);
      myscanner.close();
    } catch (FileNotFoundException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
    System.exit(0);
  }

}
/*
 * 
 */

/*
 * @author Jerry Heuring
 * This is the MailAddressInterface you are to implement for 
 * Project 0.  You will need a class that implements this interface.
 * 
 * Obviously, you will need to add classes beyond those described here.
 * Your class will need to support a Constructor (or Constructors) as
 * well as a toString method. 
 * 
 * Revisions:
 *     None as of 9/3/2020
 *     
 * Bugs:
 *
 */

public interface MailAddressInterface {
  /*
   * Get the name line for this address.
   * @return the name line for this address (Mr. John Doe)
   */
  public String getName();
  /*
   * Get the first address line for this address.
   * @return  First line of the street address for this address
   */
  public String getAddressLine1();
  /*
   * Get the second address line for this address (may be null or the 
   * empty string if there is none).
   * @return  Second line of the street address (if any) for this address
   */
  public String getAddressLine2();
  /*
   * Get the city for this address.
   * 
   * @return  The name of the city for this address.
   */
  public String getCity();
  /*
   * Get the name of the state or the state abbreviation for this address.
   * @return  The name of the state or the abbreviation of the state for this address.
   */
  public String getState();
  /*
   * Get the zip code for this address. 
   * @return  The 5 digit zip code for this address.  
   */
  public int getZipCode();
  /*
   * Get the n't digit of the zip code for this address.  Digit 1 is the units digit and
   * zip codes MUST be only 5 digits for this project.  If my zip code is 98765 then 
   * digit 1 = 5
   * digit 2 = 6
   * digit 3 = 7
   * digit 4 = 8
   * digit 5 = 9
   * 
   * @param digit  which digit of the zip code to return.  Digit 1 is the units digit.
   * @return  The n'th digit of the zip code.  
   */
  public int getZipCodeDigit(int digit);
}
public class ConcreteMailAddress implements MailAddressInterface
{
  public String name;
  public String address1;
  public String address2;
  public String city;
  public String state;
  public int zipCode;
  
  public ConcreteMailAddress(String name, String address1, String address2, String city, String state, int zipCode)
  {
    this.name = name;
    this.address1 = address1;
    this.address2 = address2;
    this.city = city;
    this.state = state;
    this.zipCode = zipCode;
  }
  
  public String getName()
  {
    return this.name;
  }
  public String getAddressLine1()
  {
    return this.address1;
  }
  public String getAddressLine2()
  {
    return this.address2;
  }
  public String getCity()
  {
    return this.city;
  }
  public String getState()
  {
    return this.state;
  }
  public int getZipCode()
  {
    return this.zipCode;
  }
  public int getZipCodeDigit(int a)
  {
    return a;
  } 
}